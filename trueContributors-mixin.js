const trueContributors = {

    /**
     * Method to fetch contributors list based on number of issue comments and commits across an organization
     * @param  {String} parameters      [Parameters to be used in GitHub API request]
     * @return {Array}                  [Array of GitHub users with data about how many commit and comment contributions they made to an organization]
     */
    async listCommitCommentContributorsForOrg(parameters) {
        return this._listForOrgHelper("listCommitCommentContributors", parameters);
    },

    /**
     * Method to fetch commit contributors across an organization
     * @param  {String} parameters      [Parameters to be used in GitHub API request]
     * @return {Array}                  [Array of GitHub users with data about how many commits they made to an organization]
     */
    async listCommitContributorsForOrg(parameters) {
        return this._listForOrgHelper("listCommitContributors", parameters);
    },

    /**
     * Method to fetch commit contributors across an organization
     * @param  {String} parameters      [Parameters to be used in GitHub API request]
     * @return {Array}                  [Array of GitHub users with data about how many commits they made to an organization]
     */
    async listContributorsForOrg(parameters) {
        return this._listForOrgHelper("listContributors", parameters);
    },

    /**
     * Method to fetch contributors list based on number of issue comments across an organization
     * @param  {String} parameters      [Parameters to be used in GitHub API request]
     * @return {Array}                  [Array of GitHub users with data about how many issue comments they made to an organization]
     */
    async listCommentContributorsForOrg(parameters) {
        return this._listForOrgHelper("listCommentContributors", parameters);
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
                await this._listContributors(desiredParams);

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
        let commits = [];
        // Catch unintentional paginate errors to check if called on empty repo.
        // For more, see https://github.com/octokit/plugin-paginate-rest.js/issues/158 
        try {
            commits = await this.paginate(this.repos.listCommits, desiredParams);
        } catch(err) {
            // If error is regarding empty repo, use empty commits array. If not, propigate error
            if(err.status != 409 || err.message != "Git Repository is empty.") {
                throw err;
            }
        }
        return this._aggregateContributions(commits, "author");
    },

    /**
     * Method to fetch contributors for a repository list based on number of issue comments.
     * @param  {String} parameters      [Parameters to be used in GitHub API request]
     * @return {Array}                  [Array of GitHub users with data about how many comments they made]
     */
    async listCommentContributors(parameters) {
        let desiredParams = this._createParamsFromObject(["owner", "repo", "since"], parameters);
        let issueComments = await this.paginate(this.issues.listCommentsForRepo, desiredParams);
        return this._aggregateContributions(issueComments, "user");
    },

    /**
     * Helper method used by organization contributor methods to call corresponding subsequent endpoint 
     * This helper was created to reduce the amount of reduncancy in the organization contributor fetching methods. 
     * @param {String} endpoint         [Subsequent endpoint to fetch contributors with]
     * @param {String} parameters       [Parameters to be used in GitHub API request] 
     */
    async _listForOrgHelper(endpoint, parameters){
        if(
            endpoint != "listCommentContributors" &&
            endpoint != "listContributors" &&
            endpoint != "listCommitContributors" &&
            endpoint != "listCommitCommentContributors"
        ) throw new TypeError(`Unexpected endpoint ${endpoint} provided.`);
        let desiredParams = this._createParamsFromObject(["org", "type"], parameters);
        let repos = await this.paginate(this.repos.listForOrg, desiredParams);

        let contributors = [];
        for(let repo of repos) {
            let repoContributors;
            let params = { owner: repo.owner.login, repo: repo.name, ...parameters }
            if(endpoint == "listCommentContributors") repoContributors = repoContributors = await this.listCommentContributors(params);
            else if(endpoint == "listContributors") repoContributors = await this._listContributors(params);
            else if(endpoint == "listCommitContributors") repoContributors = await this.listCommitContributors(params);
            else if (endpoint == "listCommitCommentContributors") repoContributors = await this.listCommitCommentContributors(params);
            contributors = contributors.concat(repoContributors);
        }
        return this._aggregateContributors(contributors);
    },

    /**
     * Helper method to fetch paginated list of GitHub contributors. Even though Octokit has an endpoint to 
     * fetch a paginated list of commit contributors (i.e octokit.paginate(octokit.repos.listContributors, ...)),
     * this main reason for this helper method is to include functionality to check for an unintended Type Error
     * that octokit.paginate(octokit.repos.listContributors, ...) throws when a given repo is empty. I wanted this mixin
     * to not throw errors on empty repos, but rather return an empty array.  
     * For more information on this unintentional error, see this GitHub issue from Octokit's paginate repository;
     * https://github.com/octokit/plugin-paginate-rest.js/issues/158 
     * @param {String} parameters       [Parameters to be used in GitHub API request] 
     */
    async _listContributors(parameters) {
        let contributors = [];
        // Catch octokit.paginate errors to check if caused from calling paginate on empty repo.
        try {
            contributors = this.paginate(this.repos.listContributors, parameters);
        } catch(err) {
            // Use octokit.repos.listContributors to check if error stems from calling paginate on empty repo.
            let res = await this.repos.listContributors(parameters);
            // Status 204 with message "204 No Content" means empty repo and we can ignore octokit.paginate error.
            // Any other response will propigate the original error from octokit.paginate, as I am not sure why
            // octokit.paginate would throw an error with any other octokit.repos.listContributors status/message.
            if(res.status != 204 || res.headers.status != "204 No Content") throw err;
        }
        return contributors;
    },

    /**
     * Helper method to aggregate GitHub contribution objects into an array of sorted contributors
     * @param  {Array}  contributions           [Array of GitHub contribution objects]
     * @param  {String} contributionIdentifier  [Porperty name used in contribution object that represents contributor]
     * @return {Array}                          [Array of GitHub users with data about how many contributions they made sorted by contribution count]
     */
    _aggregateContributions(contributions, contributionIdentifier) {
        if(!contributionIdentifier) throw new ReferenceError("Error: no contribution identifier was given to _aggregateContributions.");
        // Convert contributions array to array of contributors 
        let contributorArray = contributions
            .filter((contribution) => {
                // Filter contributors with null values for contributionIdentifiers and throw if contributionIdentifier is not a property of the contribution
                if(!contribution.hasOwnProperty(contributionIdentifier)) throw new ReferenceError(`Error: contribution ${JSON.stringify(contribution)} has no property ${contributionIdentifier}.`);
                return contribution[contributionIdentifier];
            })
            .map((contribution) => ( {...contribution[contributionIdentifier], contributions: 1} )); // Create array of shallow user copies with added contributions property
        return this._aggregateContributors(contributorArray);
    },

    /**
     * Helper method to aggregate an array of GitHub contributor objects
     * @param  {Array}  contributors           [Array of GitHub contributor objects]
     * @return {Array}                         [Array of GitHub users with data about how many contributions they made]
     */
    _aggregateContributors(contributors) {
        // Reduce contributors list to dictionary of unique contributors with total contributions
        let contributorDictionary = contributors.reduce(this._reduceContributors, {});
        // Convert dictionary to sorted array
        return this._contributorDictToArr(contributorDictionary);
    },

    /**
     * Helper method to pass to Array.reduce() that reduces a list of contributors
     * @param  {Object}  contributorDict        [Accumulator dictionary that will be used for reduce function]
     * @param  {Object} contributor             [Current contributor in the array]
     * @return {Object}                         [Dictionary of contributors mapping users to user metadata containing contribution count]
     */
    _reduceContributors(contributorDict, contributor) {
        if(!contributor.hasOwnProperty("contributions")) throw new ReferenceError(`Error: contributor ${JSON.stringify(contributor)} has no property contributions.`);
        if(!contributor.hasOwnProperty("id")) throw new ReferenceError(`Error: contributor ${JSON.stringify(contributor)} has no property id.`);
        // If user id for this contributor exists in dictionary, add a contribution to that user
        if(contributor.id in contributorDict) {
            contributorDict[contributor.id].contributions += contributor.contributions;
        // If user id for this comment does not exist, add user to dictionary
        } else {
            contributorDict[contributor.id] = { ...contributor }
        }
        return contributorDict;
    },

    /**
     * Helper method to fetch desired parameters from a given parameters object
     * @param  {Array}  desiredParameters       [Array of parameter string names]
     * @param  {String} givenObject             [Object containing parameter names and their values]
     * @return {Object}                         [Object with desired parameter names and their values]
     */
    _createParamsFromObject(desiredParameters, givenObject) {
        let parameters = {};
        for(let parameter of desiredParameters) {
            let parameterValue = givenObject[parameter];
            if(parameterValue) parameters[parameter] = parameterValue; 
        }
        return parameters;
    },

    /**
     * Helper method to convert a dictionary of contributors to a sorted array of contributors
     * @param  {Object} dictionary      [JSON contributor dictionary to be converted to array]
     * @return {Array}                  [Array of users sorted by their contributions]
     */
    _contributorDictToArr(dictionary) {
        if(!dictionary) throw new ReferenceError("Error: user dictionary is not defined.");
        let array = [];
        for(let item in dictionary) {
            array.push(dictionary[item]);
        }
        return array.sort(this._sortByContributions);
    },

    /**
     * Helper sorting function method to pass to sorting function based on a property called "contributions"
     * @param {Object} a               [Contributor object]
     * @param {Object} b               [Contributor object]
     * @return {Integer}               [An integer used to determine order between contribution comparison]
     */
    _sortByContributions(a, b) {
        if(a["contributions"] == undefined || b["contributions"] == undefined) throw new ReferenceError("Error: tried to sort by contributions while object has no contribution property.");
        return b["contributions"] - a["contributions"];
    }

}

module.exports = trueContributors;