require('dotenv').config()
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit();

(async () => {
    let contributors = await octokit.paginate(octokit.repos.listContributors, {
        owner: "github",
        repo: "opensourcefriday"
    });
    
    let issueComments = await octokit.paginate(octokit.issues.listCommentsForRepo, {
        owner: "github",
        repo: "opensourcefriday"
    });
    let combinedContributors = aggregateContributorsAndComments(contributors, issueComments);
    combinedContributors.sort(function(a, b){
        if(a.contributions < b.contributions) {
            return 1;
        } else if(a.contributions > b.contributions) {
            return -1;
        }
        return 0;
    });
    console.log(combinedContributors);
    
})()

function aggregateContributorsAndComments(contributors, issueComments){
    let userDictionary = {};
    for(contributor of contributors) userDictionary[contributor.id] = contributor;
    for(comment of issueComments) {
        let commenter = comment.user;
        if(commenter.id in userDictionary){
            userDictionary[commenter.id].contributions++;
        } else {
            commenter.contributions = 1;
            userDictionary[commenter.id] = commenter;
        }
    }
    let userArray = [];
    for(let user in userDictionary) {
        userArray.push(userDictionary[user]);
    }
    return userArray;
}