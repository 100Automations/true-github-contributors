require("dotenv").config();
const fs = require('fs');
const { Octokit } = require("@octokit/rest");
const trueContributors = require("../../trueContributors-mixin");

Object.assign(Octokit.prototype, trueContributors);
const octokit = new Octokit({ auth: process.env.token });

(async ()=> {
    const parameters = {
        org: "Public-Tree-Map"
    };

    // trueContributors endpoint that aggregates octokit's listContributors endpoint across an org
    let trueContributors = await octokit.listContributorsForOrg(parameters);
    console.log(`listContributorsForOrg returned ${trueContributors.length} contributors`);
    fs.writeFileSync(`${__dirname}/listContributorsForOrg.json`, JSON.stringify(trueContributors, null, 2));

})();