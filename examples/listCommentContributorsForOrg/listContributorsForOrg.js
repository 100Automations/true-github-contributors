require("dotenv").config();
const fs = require('fs');
const { Octokit } = require("@octokit/rest");
const trueContributors = require("../../contributors-mixin");

Object.assign(Octokit.prototype, trueContributors);
const octokit = new Octokit({ auth: process.env.token });

(async ()=> {
    const parameters = {
        org: "hackforla"
    };

    // trueContributors endpoint that accounts for issue comments
    let trueContributors = await octokit.listCommentContributorsForOrg(parameters);
    console.log(`listCommentContributorsForOrg returned ${trueContributors.length} contributors`);
    fs.writeFileSync(`${__dirname}/listCommentContributorsForOrg.json`, JSON.stringify(trueContributors, null, 2));

    // Fetching comment contributors since a given date
    let since = "2020-09-11T11:01:06.000Z";
    let trueContributorsSince = await octokit.listCommentContributorsForOrg({ ...parameters, since });
    console.log(`listCommentContributorsForOrg since ${since} returned ${trueContributorsSince.length} contributors`);
    fs.writeFileSync(`${__dirname}/listCommentContributorsForOrgSince.json`, JSON.stringify(trueContributorsSince, null, 2));
    
})();