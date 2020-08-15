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
    
    /**
     * Method to fetch contributors list based on number of issue comments and commits across an organization
     * @param  {String} org             [Name of GitHub organization]
     * @return {Array}                  [Array of GitHub users with data about how many contributions they made to an organization]
     */
    async getContributorsOrg(org) {
        let repos = await this.octokit.paginate(this.octokit.repos.listForOrg, {
            org
        });
        
        let contributors = []
        for(let repo of repos) {
            let repoContributors = await this.getCombinedContributors({owner: repo.owner.login, repo: repo.name});
            contributors = contributors.concat(repoContributors);
        }
        contributors = this._aggregateContributions(contributors);
        return contributors.sort(this._sortBy("contributions"));
    }

    /**
     * Method to fetch contributors list based on number of issue comments and commits
     * @param  {String} owner           [Name of login for repository owner]
     * @param  {String} repo            [Name of repository]
     * @return {Array}                  [Array of GitHub users with data about how many contributions they made]
     */
    async getCombinedContributors({owner, repo} = {}) {
        let contributors = await this.octokit.paginate(this.octokit.repos.listContributors, {
            owner,
            repo
        });
        let commentContributors = await this.getCommentContributors({owner, repo});

        let combinedContributors = this._aggregateContributions([].concat(contributors, commentContributors));
        combinedContributors.sort(this._sortBy("contributions"));
        return combinedContributors;
    }

    /**
     * Method to fetch contributors list based on number of issue comments
     * @param  {String} owner           [Name of login for repository owner]
     * @param  {String} repo            [Name of repository]
     * @return {Array}                  [Array of GitHub users with data about how many issue comments they made under the field of 'contributions']
     */
    async getCommentContributors({owner, repo}) {
        let issueComments = await this.octokit.paginate(this.octokit.issues.listCommentsForRepo, {
            owner,
            repo
        });
        let commentContributors = this._aggregateIssueComments(issueComments);
        commentContributors.sort(this._sortBy("contributions"));
        return commentContributors;
    }

    /**
     * Helper method to aggregate GitHub comment objects into a list of contributors
     * @param  {Array} issueComments    [Array of GitHub comment objects]
     * @return {Array}                  [Array of GitHub users with data about how many issue comments they made under the field of 'contributions']
     */
    _aggregateIssueComments(issueComments) {
        // Use JSON to create a dictionary of users and their contributions 
        let userCommentDictionary = {};
        for(let comment of issueComments) {
            let contributor = comment.user;
            // If user id for this comment exists in dictionary, add a contribution to that user
            if(contributor.id in userCommentDictionary) {
                userCommentDictionary[contributor.id].contributions++;
            // If user id for this comment does not exist, add user to dictionary with one contribution
            } else {
                userCommentDictionary[contributor.id] = contributor;
                userCommentDictionary[contributor.id].contributions = 1;
            }
        }
        // Convert JSON dictionary to a list of users
        return this._convertDictionaryToArray(userCommentDictionary);
    }

    /**
     * Helper method to aggregate GitHub contributors
     * @param  {Array} contributorData          [Array of GitHub contributors based on commits]
     * @param  {Array} aggregateCommentData     [Array of GitHub contributors based on issue comments]
     * @return {Array}                          [Array of GitHub users with data about how many contributions they made]
     */
    _aggregateContributions(contributorsList) {
        // Use JSON to create a dictionary of users and their contributions
        let contributorsDictionary = {};
        for(let contributor of contributorsList) {
            // If user id for this contributor exists in dictionary, add new contributor's contributions to the existing contributions 
            if(contributor.id in contributorsDictionary) {
                contributorsDictionary[contributor.id].contributions += contributor.contributions;
            // If user id for this contributor does not exist, add the the contributor to the dictionary
            } else {
                contributorsDictionary[contributor.id] = contributor;
            }
        }
        // Convert JSON dictionary to a list of users
        return this._convertDictionaryToArray(contributorsDictionary);
    }

    /**
     * Helper method to convert an object to an array populated by the values corresponding to the object keys
     * @param  {Object} dictionary      [JSON object to be converted to array]
     * @return {Array}                  [Array of values corresponding to the keys of the dictionary object]
     */
    _convertDictionaryToArray(dictionary) {
        let array = [];
        for(let item in dictionary) {
            array.push(dictionary[item]);
        }
        return array;
    }

    /**
     * Helper method to provide a function to sorting functions based on the provided parameter
     * @param  {String} parameter       [Parameter to sort by]
     * @return {Function}               [A function that can be passed to JavaScripts sort() method]
     */
    _sortBy(parameter) {
        let sortFunction = function(a, b){
            if (a[parameter] < b[parameter]) {
                return 1;
              }
            if (a[parameter] > b[parameter]) {
                return -1;
            }
            return 0;
        }
        return sortFunction
    }
}

module.exports = GitHubHelper;