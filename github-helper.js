const { Octokit } = require("@octokit/rest");

class GitHubHelper {

    /**
     * Constructs a GitHubHelper object with a given api token.
     * @param  {String} apiToken        [Api token of given GitHub API app]
     */
    constructor(apiToken){
        this.octokit = new Octokit({
            auth: apiToken
        });
    }

    async getCommitContributorsOrg({ org, since }) {
        let repos = await this.octokit.paginate(this.octokit.repos.listForOrg, {
            org
        });

        let contributors = [];
        for(let repo of repos) {
            let repoContributors = await this.getCommitContributors({owner: repo.owner.login, repo: repo.name, since});
            contributors = contributors.concat(repoContributors);
        }
        return this._aggregateContributions(contributors);
    }

    /**
     * Method to fetch contributors list based on number of issue comments
     * @param  {Object} parameters      [Parameters to be included in GitHub API request]
     * @return {Array}                  [Array of GitHub users with data about how many commits they made based on the parameters]
     */
    async getCommitContributors({owner, repo, since}) {
        let parameters = (since) ? { owner, repo, since } : { owner, repo }
        let commits = await this.octokit.paginate(this.octokit.repos.listCommits, parameters);
        return this._aggregateContributions(commits, "author");
    }

    /**
     * Method to fetch contributors list based on commits across an organization
     * @param  {String} org             [Name of GitHub organization]
     * @return {Array}                  [Array of GitHub users with data about how many commits they made to an organization]
     */
    async getContributorsOrg({org}) {
        let repos = await this.octokit.paginate(this.octokit.repos.listForOrg, {
            org
        });

        let contributors = [];
        for(let repo of repos) {
            let repoContributors = await this.octokit.paginate(this.octokit.repos.listContributors, {
                owner: repo.owner.login,
                repo: repo.name
            });
            contributors = contributors.concat(repoContributors);
        }
        return this._aggregateContributions(contributors);
    }
    
    /**
     * Method to fetch contributors list based on number of issue comments across an organization
     * @param  {String} org             [Name of GitHub organization]
     * @param  {String} since           [ISO 8601 format of latest date to fetch comments (optional)]
     * @return {Array}                  [Array of GitHub users with data about how many issue comments they made to an organization]
     */
    async getCommentContributorsOrg({org, since}) {
        let repos = await this.octokit.paginate(this.octokit.repos.listForOrg, {
            org
        });

        let contributors = [];
        for(let repo of repos) {
            let parameters = (since) ? { owner: repo.owner.login, repo: repo.name, since } : { owner: repo.owner.login, repo: repo.name }
            let repoContributors = await this.getCommentContributors(parameters);
            contributors = contributors.concat(repoContributors);
        }
        return this._aggregateContributions(contributors);
    }

    /**
     * Method to fetch contributors list based on number of issue comments and commits across an organization
     * @param  {String} org             [Name of GitHub organization]
     * @return {Array}                  [Array of GitHub users with data about how many contributions they made to an organization]
     */
    async getCommitCommentContributorsOrg({org}) {
        let repos = await this.octokit.paginate(this.octokit.repos.listForOrg, {
            org
        });
        
        let contributors = [];
        for(let repo of repos) {
            let repoContributors = await this.getCommitCommentContributors({owner: repo.owner.login, repo: repo.name});
            contributors = contributors.concat(repoContributors);
        }
        return this._aggregateContributions(contributors);
    }

    /**
     * Method to fetch contributors list based on number of issue comments and commits
     * @param  {String} owner           [Name of login for repository owner]
     * @param  {String} repo            [Name of repository]
     * @return {Array}                  [Array of GitHub users with data about how many contributions they made]
     */
    async getCommitCommentContributors({owner, repo}) {
        let contributors = await this.octokit.paginate(this.octokit.repos.listContributors, {
            owner,
            repo
        });
        let commentContributors = await this.getCommentContributors({owner, repo});

        return this._aggregateContributions([].concat(contributors, commentContributors));
    }

    /**
     * Method to fetch contributors list based on number of issue comments
     * @param  {String} owner           [Name of login for repository owner]
     * @param  {String} repo            [Name of repository]
     * @param  {String} since           [ISO 8601 format of latest date to fetch comments (optional)]
     * @return {Array}                  [Array of GitHub users with data about how many issue comments they made under the field of 'contributions']
     */
    async getCommentContributors({owner, repo, since}) {
        let parameters = (since) ? { owner, repo, since } : { owner, repo }
        let issueComments = await this.octokit.paginate(this.octokit.issues.listCommentsForRepo, parameters);
        return this._aggregateContributions(issueComments, "user");
    }

    /**
     * Helper method to aggregate GitHub contributor objects
     * @param  {Array}  contributors           [Array of GitHub contributor objects]
     * @return {Array}                         [Array of GitHub users with data about how many contributions they made]
     */
    _aggregateContributors(contributors) {
        // Use JSON to create a dictionary of users and their contributions
        let contributorDictionary = {};
        for(let contributor of contributors) {
            if(!contributor.hasOwnProperty("contributions")) throw `Error: contributor ${contributor} has no property contributions`;
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
    }

    /**
     * Helper method to aggregate GitHub contribution objects
     * @param  {Array}  contributions           [Array of GitHub contribution objects]
     * @param  {String} contributionIdentifier  [Porperty name used in contribution object that represents user]
     * @return {Array}                          [Array of GitHub users with data about how many contributions they made]
     */
    _aggregateContributions(contributions, contributionIdentifier) {
        if(!contributionIdentifier) throw "Error: no contribution identifier was given to _aggregateContributions";
        // Use JSON to create a dictionary of users and their contributions
        let contributorDictionary = {};
        for(let contribution of contributions) {
            if(!contribution.hasOwnProperty(contributionIdentifier)) throw `Error: contribution ${contribution} has no property ${contributionIdentifier}`;
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
    }

    /**
     * Helper method to convert an object to an array populated by the values corresponding to the object keys
     * @param  {Object} dictionary      [JSON object to be converted to array]
     * @return {Array}                  [Array of values corresponding to the keys of the dictionary object]
     */
    _contributorDictToArr(dictionary) {
        if(!dictionary) throw `Error: user dictionary is not defined`;
        let array = [];
        for(let item in dictionary) {
            array.push(dictionary[item]);
        }
        return array.sort(this._sortByContributions);
    }

    /**
     * Helper method to provide a sorting function based on a property called "contributions"
     * @return {Integer}               [An integer used to determine order between contribution comparison]
     */
    _sortByContributions(a, b) {
        if(a["contributions"] == undefined || b["contributions"] == undefined) throw `Error: contibutions on is not defined on all user objects`;
        if (a["contributions"] < b["contributions"]) {
            return 1;
        }
        if (a["contributions"] > b["contributions"]) {
            return -1;
        }
        return 0;
    }
}

module.exports = GitHubHelper;