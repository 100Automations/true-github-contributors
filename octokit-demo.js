require('dotenv').config()
const fs = require('fs');
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
    auth: process.env.token
});

(async () => {
    let contributors = await octokit.paginate("Get /repos/:owner/:repo/contributors", {
        owner: "github",
        repo: "opensourcefriday"
    });
    
    let issueComments = await octokit.paginate("GET /repos/:owner/:repo/issues/comments", {
        owner: "github",
        repo: "opensourcefriday"
    })
    let aggregateComments = aggregateIssueComments(issueComments);
    aggregateComments.sort(sortBy("contributions"));
    
    let combinedContributors = combineCommitComment(contributors, aggregateComments);
    combinedContributors.sort(sortBy("contributions"));
    fs.writeFileSync("./data/contributors-combined.json", JSON.stringify(combinedContributors, null, 2));
})()

function aggregateIssueComments(issueComments) {
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
    let userContributionArray = [];
    for(let user in userCommentDictionary) {
        userContributionArray.push(userCommentDictionary[user]);
    }
    return userContributionArray;
}
  
function combineCommitComment(contributorData, aggregateCommentData) {
    let combinedLists = [].concat(contributorData, aggregateCommentData);
    // Use JSON to create a dictionary of users and their contributions
    let contributorsDictionary = {};
    for(let contributor of combinedLists) {
        // If user id for this contributor exists in dictionary, add new contributor's contributions to the existing contributions 
        if(contributor.id in contributorsDictionary) {
            contributorsDictionary[contributor.id].contributions += contributor.contributions;
        // If user id for this contributor does not exist, add the the contributor to the dictionary
        } else {
            contributorsDictionary[contributor.id] = contributor;
        }
    }
    // Convert JSON dictionary to a list of users
    let contributorArray = [];
    for(let user in contributorsDictionary) {
      contributorArray.push(contributorsDictionary[user]);
    }
    return contributorArray;
}

function sortBy(parameter) {
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