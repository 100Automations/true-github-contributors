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
     * Method to fetch contributors list based on number of issue comments
     * @param  {Object} parameters      [Parameters to be included in GitHub API request]
     * @return {Array}                  [Array of GitHub users with data about how many commits they made based on the parameters]
     */
    async getCommitContributions({owner, repo, since}) {
        let parameters = (since) ? { owner, repo, since } : { owner, repo }
        let commits = await this.octokit.paginate(this.octokit.repos.listCommits, parameters);
        let commitsAggregate = this._aggregateContributions(commits, "author");
        commitsAggregate.sort(this._sortBy("contributions"));
        return commitsAggregate;
    }

    /**
     * Method to fetch contributors list based on commits across an organization
     * @param  {String} org             [Name of GitHub organization]
     * @return {Array}                  [Array of GitHub users with data about how many commits they made to an organization]
     */
    async getCommitContributorsOrg({org}) {
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
        contributors = this._aggregateContributions(contributors);
        return contributors.sort(this._sortBy("contributions"));
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
            let repoContributors = await this.getCommentContributors({owner: repo.owner.login, repo: repo.name, since});
            contributors = contributors.concat(repoContributors);
        }
        contributors = this._aggregateContributions(contributors);
        return contributors.sort(this._sortBy("contributions"));
    }

    /**
     * Method to fetch contributors list based on number of issue comments and commits across an organization
     * @param  {String} org             [Name of GitHub organization]
     * @return {Array}                  [Array of GitHub users with data about how many contributions they made to an organization]
     */
    async getContributorsOrg({org}) {
        let repos = await this.octokit.paginate(this.octokit.repos.listForOrg, {
            org
        });
        
        let contributors = [];
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
    async getCombinedContributors({owner, repo}) {
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
     * @param  {String} since           [ISO 8601 format of latest date to fetch comments (optional)]
     * @return {Array}                  [Array of GitHub users with data about how many issue comments they made under the field of 'contributions']
     */
    async getCommentContributors({owner, repo, since}) {
        let parameters = (since) ? { owner, repo, since } : { owner, repo }
        let issueComments = await this.octokit.paginate(this.octokit.issues.listCommentsForRepo, parameters);
        let commentContributors = this._aggregateContributions(issueComments, "user");
        commentContributors.sort(this._sortBy("contributions"));
        return commentContributors;
    }

    /**
     * Helper method to aggregate GitHub contributions
     * @param  {Array}  contributions           [Array of GitHub contribution objects or contributor objects]
     * @param  {String} contributionIdentifier  [Porperty name used in contribution object that represents user (leave blank if contributions is an array of contributor objects)]
     * @return {Array}                          [Array of GitHub users with data about how many contributions they made]
     */
    _aggregateContributions(contributions, contributionIdentifier) {
        // Use JSON to create a dictionary of users and their contributions 
        let contributorDictionary = {};
        for(let contribution of contributions) {
            let contributor = (contributionIdentifier) ? contribution[contributionIdentifier] : contribution;
            // Contributions can have a null author, so we should ignore those.
            if(!contributor) continue;
            // If user id for this comment exists in dictionary, add a contribution to that user
            if(contributor.id in contributorDictionary) {
                if(contributor.contributions) {
                    contributorDictionary[contributor.id].contributions += contributor.contributions;
                } else {
                    contributorDictionary[contributor.id].contributions++;
                }
            // If user id for this comment does not exist, add user to dictionary with one contribution
            } else {
                if(contributor.contributions) {
                    contributorDictionary[contributor.id] = contributor
                } else {
                    contributorDictionary[contributor.id] = contributor;
                    contributorDictionary[contributor.id].contributions = 1; 
                }
            }
        }
        // Convert JSON dictionary to a list of users
        return this._convertDictionaryToArray(contributorDictionary);
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