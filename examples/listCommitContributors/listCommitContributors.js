require("dotenv").config();
const fs = require('fs');
const { Octokit } = require("@octokit/rest");
const trueContributors = require("../../contributors-mixin");

Object.assign(Octokit.prototype, trueContributors);
const octokit = new Octokit({ auth: process.env.token });

(async ()=> {
    const parameters = {
        owner: "hackforla",
        repo: "website"
    };
    
    // Octokit's contributors endpoint that accounts for commits
    let octokitContributors = await octokit.paginate(octokit.repos.listContributors, parameters);
    console.log(`octokitContributors returned ${octokitContributors.length} contributors`);
    fs.writeFileSync(`${__dirname}/listContributors.json`, JSON.stringify(octokitContributors, null, 2));

    // trueContributors endpoint that accounts for commits
    let trueContributors = await octokit.listCommitContributors(parameters);
    console.log(`listCommitContributors returned ${trueContributors.length} contributors`);
    fs.writeFileSync(`${__dirname}/listCommitContributors.json`, JSON.stringify(trueContributors, null, 2));

    // Fetching commit contributors since a given date
    let since = "2020-09-11T11:01:06.000Z"
    let trueContributorsSince = await octokit.listCommitContributors({ ...parameters, since });
    console.log(`listCommitContributors since ${since} returned ${trueContributorsSince.length} contributors`);
    fs.writeFileSync(`${__dirname}/listCommitContributorsSince.json`, JSON.stringify(trueContributorsSince, null, 2));
    

    // Fetching commit contributors to a specific file
    let path = "credits.html";
    let trueContributorsPath = await octokit.listCommitContributors({ ...parameters, path });
    console.log(`listCommitContirbutors to path ${path} returned ${trueContributorsPath.length} contributors`);
    fs.writeFileSync(`${__dirname}/listCommitContributorsPath.json`, JSON.stringify(trueContributorsPath, null, 2));
    

})();