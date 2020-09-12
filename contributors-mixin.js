let contributorsMixin = {

    /**
     * Method to fetch contributors list based on number of issue comments and commits across an organization
     * @param  {String} parameters      [Parameters to be used in GitHub API request]
     * @return {Array}                  [Array of GitHub users with data about how many commit and comment contributions they made to an organization]
     */
    async listCommitCommentContributorsForOrg(parameters) {
        let desiredParams = this._createParamsFromObject(["org", "type"], parameters);
        let repos = await this.paginate(this.repos.listForOrg, desiredParams);
        
        let contributors = [];
        for(let repo of repos) {
            let repoContributors = await this.listCommitCommentContributors({owner: repo.owner.login, repo: repo.name, ...parameters});
            contributors = contributors.concat(repoContributors);
        }
        return this._aggregateContributors(contributors);
    },

    /**
     * Method to fetch commit contributors across an organization
     * @param  {String} parameters      [Parameters to be used in GitHub API request]
     * @return {Array}                  [Array of GitHub users with data about how many commits they made to an organization]
     */
    async listCommitContributorsForOrg(parameters) {
        let desiredParams = this._createParamsFromObject(["org", "type"], parameters);
        let repos = await this.paginate(this.repos.listForOrg, desiredParams);

        let contributors = [];
        for(let repo of repos) {
            let repoContributors = await this.listCommitContributors({owner: repo.owner.login, repo: repo.name, ...parameters});
            contributors = contributors.concat(repoContributors);
        }
        return this._aggregateContributors(contributors);
    },

    /**
     * Method to fetch commit contributors across an organization
     * @param  {String} parameters      [Parameters to be used in GitHub API request]
     * @return {Array}                  [Array of GitHub users with data about how many commits they made to an organization]
     */
    async listContributorsForOrg(parameters) {
        let desiredParams = this._createParamsFromObject(["org", "type"], parameters);
        let repos = await this.paginate(this.repos.listForOrg, desiredParams);

        let contributors = [];
        for(let repo of repos) {
            let repoContributors = await this.paginate(this.repos.listContributors, { owner: repo.owner.login, repo: repo.name, ...parameters });
            contributors = contributors.concat(repoContributors);
        }
        return this._aggregateContributors(contributors);
    },

    /**
     * Method to fetch contributors list based on number of issue comments across an organization
     * @param  {String} parameters      [Parameters to be used in GitHub API request]
     * @return {Array}                  [Array of GitHub users with data about how many issue comments they made to an organization]
     */
    async listCommentContributorsForOrg(parameters) {
        let desiredParams = this._createParamsFromObject(["org", "type"], parameters);
        let repos = await this.paginate(this.repos.listForOrg, desiredParams);

        let contributors = [];
        for(let repo of repos) {
            let commentParameters = { owner: repo.owner.login, repo: repo.name, ...parameters };
            let repoContributors = await this.listCommentContributors(commentParameters);
            contributors = contributors.concat(repoContributors);
        }
        return this._aggregateContributors(contributors);
    },

    /**
     * Method to fetch contributors list based on number of issue comments and commits
     * @param  {String} parameters      [Parameters to be used in GitHub API request]
     * @return {Array}                  [Array of GitHub users with data about how many contributions they made]
     */
    async listCommitCommentContributors(parameters) {
        let desiredParams = this._createParamsFromObject(["owner", "repo", "since"], parameters);
        // If since is a parameter, use listCommitContributors method. If not, use octokit's faster listContributors endpoint
        let contributors = (desiredParams.since) ? 
            await this.listCommitContributors(desiredParams) : 
            await this.paginate(this.repos.listContributors, desiredParams);
        let commentContributors = await this.listCommentContributors(desiredParams);

        return this._aggregateContributors(contributors.concat(commentContributors));
    },

    /**
     * Method to fetch contributors list based on number of commits
     * @param  {String} parameters      [Parameters to be used in GitHub API request]
     * @return {Array}                  [Array of GitHub users with data about how many commits they made]
     */
    async listCommitContributors(parameters) {
        let desiredParams = this._createParamsFromObject(["owner", "repo", "sha", "path", "since", "until"], parameters);
        let commits = await this.paginate(this.repos.listCommits, desiredParams);
        return this._aggregateContributions(commits, "author");
    },

    /**
     * Method to fetch contributors list based on number of issue comments
     * @param  {String} parameters      [Parameters to be used in GitHub API request]
     * @return {Array}                  [Array of GitHub users with data about how many comments they made]
     */
    async listCommentContributors(parameters) {
        let desiredParams = this._createParamsFromObject(["owner", "repo", "since"], parameters);
        let issueComments = await this.paginate(this.issues.listCommentsForRepo, desiredParams);
        return this._aggregateContributions(issueComments, "user");
    },

    /**
     * Helper method to aggregate GitHub contributor objects
     * @param  {Array}  contributors           [Array of GitHub contributor objects]
     * @return {Array}                         [Array of GitHub users with data about how many contributions they made]
     */
    _aggregateContributors(contributors) {
        // Use JSON to create a dictionary of users and their contributions
        let contributorDictionary = {};
        for(let contributor of contributors) {
            if(!contributor.hasOwnProperty("contributions")) throw `Error: contributor ${JSON.stringify(contributor)} has no property contributions`;
            if(!contributor.hasOwnProperty("id")) throw `Error: contributor ${JSON.stringify(contributor)} has no property id`;
            // If user id for this comment exists in dictionary, add a contribution to that user
            if(contributor.id in contributorDictionary) {
                contributorDictionary[contributor.id].contributions += contributor.contributions;
            // If user id for this comment does not exist, add user to dictionary
            } else {
                contributorDictionary[contributor.id] = contributor
            }
        }
        // Convert JSON dictionary to a list of users
        return this._contributorDictToArr(contributorDictionary);
    },

    /**
     * Helper method to aggregate GitHub contribution objects
     * @param  {Array}  contributions           [Array of GitHub contribution objects]
     * @param  {String} contributionIdentifier  [Porperty name used in contribution object that represents contributor]
     * @return {Array}                          [Array of GitHub users with data about how many contributions they made]
     */
    _aggregateContributions(contributions, contributionIdentifier) {
        if(!contributionIdentifier) throw "Error: no contribution identifier was given to _aggregateContributions";
        // Use JSON to create a dictionary of users and their contributions
        let contributorDictionary = {};
        for(let contribution of contributions) {
            if(!contribution.hasOwnProperty(contributionIdentifier)) throw `Error: contribution ${JSON.stringify(contribution)} has no property ${contributionIdentifier}`;
            let contributor = contribution[contributionIdentifier];
            // Contributions can have a null author, so we should ignore those.
            if(!contributor) continue;
            // If user id for this comment exists in dictionary, add a contribution to that user
            if(contributor.id in contributorDictionary) {
                contributorDictionary[contributor.id].contributions++;
            // If user id for this comment does not exist, add user to dictionary with one contribution
            } else {
                contributorDictionary[contributor.id] = contributor
                contributorDictionary[contributor.id].contributions = 1;
            }
        }
        // Convert JSON dictionary to a list of users
        return this._contributorDictToArr(contributorDictionary);
    },

    /**
     * Helper method to fetch desired parameters from a given parameters object
     * @param  {Array}  desiredParameters       [Array of parameter names]
     * @param  {String} givenObject             [Object containing parameter values]
     * @return {Object}                         [Object with desired parameters]
     */
    _createParamsFromObject(desiredParameters, givenObject) {
        let parameters = {};
        for(parameter of desiredParameters) {
            let parameterValue = givenObject[parameter];
            if(parameterValue) parameters[parameter] = parameterValue; 
        }
        return parameters;
    },

    /**
     * Helper method to convert a dictionary of contributors to an array of contributors
     * @param  {Object} dictionary      [JSON contributor dictionary to be converted to array]
     * @return {Array}                  [Array of users sorted by their contributions]
     */
    _contributorDictToArr(dictionary) {
        if(!dictionary) throw `Error: user dictionary is not defined`;
        let array = [];
        for(let item in dictionary) {
            array.push(dictionary[item]);
        }
        return array.sort(this._sortByContributions);
    },

    /**
     * Helper method to provide a sorting function based on a property called "contributions"
     * @return {Integer}               [An integer used to determine order between contribution comparison]
     */
    _sortByContributions(a, b) {
        if(a["contributions"] == undefined || b["contributions"] == undefined) throw `Error: tried to sort by contributions while object has no contribution property`;
        if (a["contributions"] < b["contributions"]) {
            return 1;
        }
        if (a["contributions"] > b["contributions"]) {
            return -1;
        }
        return 0;
    }

}

module.exports = contributorsMixin;