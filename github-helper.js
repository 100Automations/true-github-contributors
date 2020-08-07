const axios = require('axios');
const _ = require('lodash');

class GitHubHelper {

    /**
     * Constructs a GitHubUtil object with a given api token.
     * @param  {String} apiToken        [Api token of given GitHub API app]
     */
    constructor(apiToken){
        this.config = {
            headers: {
                Authorization: `token ${apiToken}`
            }
        }
    }

    /**
     * Method to get contributors data based on commits and issue comments
     * @param  {String} ownerLogin      [Name of login for repository owner]
     * @param  {String} repoName        [Name of repository]
     * @param  {Object} parameters      [Dictionary of parameters to be included in API request]
     * @return {Array}                  [Array of issue contributor objects that represent contributions aggregated from issue comments and commit data]
     */
    async getContributorsPlus({ownerLogin, repoName, parameters={}} = {}) {
        let issueCommentsData = await this.getIssueCommentsParsedSync({ownerLogin, repoName, parameters});
        let contributorsData = await this.getContributorsSync({ownerLogin, repoName, parameters});
        let allContributors = [].concat(issueCommentsData, contributorsData);
        // Create a dictionary with schema { gitHubUserId: userInformation } to keep track of contribution count
        let contributorsDictionary = {};
        for(let contributor of allContributors) {
            if(contributor.id in contributorsDictionary) {
                contributorsDictionary[contributor.id].contributions += contributor.contributions;
            } else {
                contributorsDictionary[contributor.id] = contributor;
            }
        }

        // Convert the user dictionary into an array of user objects
        let contributorsPlus = this._convertDictionaryToArray(contributorsDictionary);
        contributorsPlus.sort(this._sortBy('contributions'));
        return contributorsPlus;
    }

    /**
     * Method to fetch all issue comments and return it in a parsed form similar in structure to the contributors data
     * @param  {String} ownerLogin      [Name of login for repository owner]
     * @param  {String} repoName        [Name of repository]
     * @param  {Object} parameters      [Dictionary of parameters to be included in API request]
     * @return {Array}                  [Array of users with data about how many issue comments they made under the field of 'contributions']
     */
    async getIssueCommentsParsedSync({ownerLogin, repoName, parameters={}} = {}) {
        let issueCommentsData = await this.getIssueCommentsSync({ownerLogin, repoName, parameters});
        // Create a dictionary with schema { gitHubUserId: userInformation } to keep track of comment count  
        let issueCommentsParsed = {};
        for(let comment of issueCommentsData) {
            let contributor = comment.user;
            if(contributor.id in issueCommentsParsed) {
                issueCommentsParsed[contributor.id].contributions++;
            } else {
                issueCommentsParsed[contributor.id] = contributor;
                issueCommentsParsed[contributor.id].contributions = 1;
            }
        }
        // Convert the user dictionary into an array of user objects
        let issueCommentsArray = this._convertDictionaryToArray(issueCommentsParsed);
        issueCommentsArray.sort(this._sortBy('contributions'));
        return issueCommentsArray;
    }

    /**
     * Method to fetch all issue comments for a repository
     * @param  {String} ownerLogin      [Name of login for repository owner]
     * @param  {String} repoName        [Name of repository]
     * @param  {Object} parameters      [Dictionary of parameters to be included in API request]
     * @return {Array}                  [Array of issue comment objects]
     */
    async getIssueCommentsSync({ownerLogin, repoName, parameters={}} = {}) {
        let endpoint = `https://api.github.com/repos/${ownerLogin}/${repoName}/issues/comments`;
        return this.fetchAllSync(endpoint, parameters);
    }

    /**
     * Method to fetch all issue comments for a repository
     * @param  {String} ownerLogin      [Name of login for repository owner]
     * @param  {String} repoName        [Name of repository]
     * @param  {Object} parameters      [Dictionary of parameters to be included in API request]
     * @return {Array}                  [Array of issue contributor objects]
     */
    async getContributorsSync({ownerLogin, repoName, parameters={}} = {}) {
        let endpoint = `https://api.github.com/repos/${ownerLogin}/${repoName}/contributors`;
        return this.fetchAllSync(endpoint, parameters);
    }

    /**
     * Method to make request with pagination with given request url and parameters
     * @param  {String} requestUrl      [GitHub API endpoint to request]
     * @param  {Object} parameters      [Dictionary of parameters to be included in API request]
     * @return {Array}                  [Array of data objects relevant to requestUrl]
     */
    async fetchAllSync(requestUrl, parameters={}) {
        // Construct request url with given parameters
        let res = await axios.get(this._constructRequestUrl(requestUrl, parameters), this.config);
        // Return results immediataly if there is only 1 page of results.
        if(!res.headers.link){
            return Promise.resolve(res.data);
        }
        // Get page relation links from header of response and make request for next page of comments
        let linkRelations = res.headers.link.split(',').map(function(item) {
            return item.trim();
        });
        for(let linkRel of linkRelations){
            let [link, rel] = linkRel.split(';').map(function(item) {
                return item.trim();
            });
            if(rel == 'rel="next"'){
                // Make recursive call to same method to get next page of comments
                link = link.substring(1, link.length - 1);
                return res.data.concat(await this.fetchAllSync(link));
            }
        }
        // If no rel="next" link relation then we are on last page of data, simply return data
        return res.data;
    }

    /**
     * Helper method to construct request urls with given parameters
     * @param  {Object} requestUrl      [URL endpoint to make request to]
     * @param  {Object} parameters      [Parameters to be added to request url]
     * @return {String}                 [The constructed url from the given url and parameters]
     */
    _constructRequestUrl(requestUrl, parameters={}) {
        requestUrl = !(_.isEmpty(parameters)) ? `${requestUrl}?`: requestUrl;
        for(let parameter in parameters){
            requestUrl = requestUrl.concat(`${parameter}=${parameters[parameter]}&`);
        }
        return requestUrl;
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