require("dotenv").config();
const sinon = require('sinon');
const { Octokit } = require("@octokit/rest");
const contributorsMixin = require("../contributors-mixin");

Object.assign(Octokit.prototype, contributorsMixin);
const octokit = new Octokit({ auth: process.env.token });

describe("_sortByContributions()", () => {
    test("should throw error if argument has no contribution property", () => {
        const inputA = { id: 1, contributions: 15 };
        const inputB = { id: 2 };

        expect(() => octokit._sortByContributions(inputA, inputB)).toThrow();
    });

    test("should return less than 0 when a has more contributions than b", () => {
        const inputA = { id: 1, contributions: 16 };
        const inputB = { id: 2, contributions: 15 };

        expect(octokit._sortByContributions(inputA, inputB)).toBeLessThan(0);
    });

    test("should return greater than 0 when b has more contributions than a", () => {
        const inputA = { id: 1, contributions: 15 };
        const inputB = { id: 2, contributions: 16 };

        expect(octokit._sortByContributions(inputA, inputB)).toBeGreaterThan(0);
    });

    test("should return 0 when a is equal to b", () => {
        const inputA = { id: 1, contributions: 15 };
        const inputB = { id: 2, contributions: 15 };

        expect(octokit._sortByContributions(inputA, inputB)).toBe(0);
    });
});

describe("_contributorDictToArr()", () => {
    test("should throw if no argument supplied", () => {
        expect(() => octokit._contributorDictToArr()).toThrow();
    });

    test("should throw if object does not have contributions property", () => {
        const input = {
            1: {id: 1, contributions: 15},
            2: {id: 2, contributions: 7},
            3: {id: 3},
            4: {id: 4, contributions: 6},
            5: {id: 5, contributions: 7}
        };

        expect(() => octokit._contributorDictToArr(input)).toThrow();
    });

    test("should return an empty array when given an empty dictionary", () => {
        const input = {};

        const output = [];

        expect(octokit._contributorDictToArr(input)).toEqual(output);
    });

    test("should return an array with a single contributor when given a dictionary of length = 1", () => {
        const input = {
            1: {id: 1, contributions: 15}
        };

        const output = [
            {id: 1, contributions: 15}
        ];

        expect(octokit._contributorDictToArr(input)).toEqual(output);
    });

    test("should list of contributor objects sorted by contributions", () => {
        const input = {
            1: {id: 1, contributions: 15},
            2: {id: 2, contributions: 7},
            3: {id: 3, contributions: 24},
            4: {id: 4, contributions: 6},
            5: {id: 5, contributions: 7}
        };

        const output = [
            {id: 3, contributions: 24},
            {id: 1, contributions: 15},
            {id: 2, contributions: 7},
            {id: 5, contributions: 7},
            {id: 4, contributions: 6}
        ];

        expect(octokit._contributorDictToArr(input)).toEqual(output);
    });
});

describe("_createParamsFromObject()", () => {
    test("should return an empty object if given object is empty", () => {
        const desiredParameters = ["desiredParam1", "desiredParam2", "desiredParam3"];
        const givenObject = {};

        const output = {};

        expect(octokit._createParamsFromObject(desiredParameters, givenObject)).toEqual(output);
    });

    test("should return an empty object if params list is empty", () => {
        const desiredParameters = [];
        const givenObject = {
            randomParam1: "value",
            randomParam2: "value",
            randomParam3: "value"
        };

        const output = {};

        expect(octokit._createParamsFromObject(desiredParameters, givenObject)).toEqual(output);
    });

    test("should return an empty object if no desired params are found", () => {
        const desiredParameters = ["desiredParam1", "desiredParam2", "desiredParam3"];
        const givenObject = {
            randomParam1: "value",
            randomParam2: "value",
            randomParam3: "value"
        };

        const output = {};

        expect(octokit._createParamsFromObject(desiredParameters, givenObject)).toEqual(output);
    });

    test("should create desired list of params", () => {
        const desiredParameters = ["desiredParam1", "desiredParam2", "desiredParam3"];
        const givenObject = {
            desiredParam1: "value",
            randomParam1: "value",
            desiredParam2: "value",
            randomParam2: "value",
            desiredParam3: "value",
            randomParam3: "value"
        };

        const output = {
            desiredParam1: "value",
            desiredParam2: "value",
            desiredParam3: "value"
        };

        expect(octokit._createParamsFromObject(desiredParameters, givenObject)).toEqual(output);
    });

    test("given parameters object should be unchanged", () => {
        const desiredParameters = ["desiredParam1", "desiredParam2", "desiredParam3"];
        const givenObject = {
            desiredParam1: "value",
            randomParam1: "value",
            desiredParam2: "value",
            randomParam2: "value",
            desiredParam3: "value",
            randomParam3: "value"
        };
        const givenObjectOriginal = {
            desiredParam1: "value",
            randomParam1: "value",
            desiredParam2: "value",
            randomParam2: "value",
            desiredParam3: "value",
            randomParam3: "value"
        };

        const output = {
            desiredParam1: "value",
            desiredParam2: "value",
            desiredParam3: "value"
        };

        octokit._createParamsFromObject(desiredParameters, givenObject)

        expect(givenObject).toEqual(givenObjectOriginal);
    });

    test("should ignore params that are declared but undefined", () => {
        const desiredParameters = ["desiredParam1", "desiredParam2", "desiredParam3"];
        const givenObject = {
            desiredParam1: "value",
            desiredParam2: undefined,
            desiredParam3: "value"
        };

        const output = {
            desiredParam1: "value",
            desiredParam3: "value"
        };

        expect(octokit._createParamsFromObject(desiredParameters, givenObject)).toEqual(output);
    });
});

describe("_aggregateContributions()", () => {
    test("should throw if input identifier not given", () => {
        const input = [];

        expect(() => octokit._aggregateContributions(input)).toThrow();
    });

    test("should throw if input identifier does not exist on object", () => {
        const input = [
            { body: "test body", user: { id: 1 } },
            { body: "test body", user: { id: 2 } },
            { body: "test body" },
            { body: "test body", user: { id: 4 } },
            { body: "test body", user: { id: 5 } },
        ];
        const inputIdentifier = "user";

        expect(() => octokit._aggregateContributions(input, inputIdentifier)).toThrow();
    });

    test("should return empty array when given empty array", () => {
        const input = [];
        const inputIdentifier = "user";

        const output = [];

        expect(octokit._aggregateContributions(input, inputIdentifier)).toEqual(output);
    });

    test("should return array of length one when given array with 1 contribution", () => {
        const input = [
            { body: "test body", user: { id: 1 } },
        ];
        const inputidentifier = "user";

        const output = [
            { id: 1, contributions: 1 }
        ];

        expect(octokit._aggregateContributions(input, inputidentifier)).toEqual(output);
    });

    test("should return sorted list of contributors", () => {
        const input = [
            { body: "test body", user: { id: 1 } },
            { body: "test body", user: { id: 1 } },
            { body: "test body", user: { id: 2 } },
            { body: "test body", user: { id: 2 } },
            { body: "test body", user: { id: 2 } },
            { body: "test body", user: { id: 3 } },
            { body: "test body", user: { id: 4 } },
        ];
        const inputIdentifier = "user";

        const output = [
            { id: 2, contributions: 3 },
            { id: 1, contributions: 2 },
            { id: 3, contributions: 1 },
            { id: 4, contributions: 1 }
        ];

        expect(octokit._aggregateContributions(input, inputIdentifier)).toEqual(output);
    });

    test("should ignore contributions with null values for input identifier", () => {
        const input = [
            { body: "test body", user: { id: 1 } },
            { body: "test body", user: { id: 2 } },
            { body: "test body", user: null },
            { body: "test body", user: { id: 4 } },
            { body: "test body", user: { id: 5 } },
        ];
        const inputIdentifier = "user";

        const output = [
            { id: 1, contributions: 1 },
            { id: 2, contributions: 1 },
            { id: 4, contributions: 1 },
            { id: 5, contributions: 1 }
        ];

        expect(octokit._aggregateContributions(input, inputIdentifier)).toEqual(output);
    });
});

describe("_aggregateContributors()", () => {
    test("should throw if no argument is given", () => {
        expect(() => octokit._aggregateContributors()).toThrow();
    });

    test("should throw if contributor has no id property", () => {
        const input = [
            {id: 1, contributions: 5},
            {id: 2, contributions: 2},
            {contributions: 10}
        ];

        expect(() => octokit._aggregateContributors(input)).toThrow();
    });

    test("should throw if contributor has no contributions property", () => {
        const input = [
            {id: 1, contributions: 5},
            {id: 2, contributions: 2},
            {id: 3}
        ];

        expect(() => octokit._aggregateContributors(input)).toThrow();
    });

    test("should return an empty array when given empty contributors array", () => {
        const input = [];

        const output = [];

        expect(octokit._aggregateContributors(input)).toEqual(output);
    });

    test("should leave a list of unique contributors unchanged but sorted", () => {
        const input = [
            {id: 1, contributions: 15},
            {id: 2, contributions: 5},
            {id: 3, contributions: 47}
        ];

        const output = [
            {id: 3, contributions: 47},
            {id: 1, contributions: 15},
            {id: 2, contributions: 5}
        ];

        expect(octokit._aggregateContributors(input)).toEqual(output);
    });

    test("should aggregate a list of contributors", () => {
        const input = [
            {id: 1, contributions: 15},
            {id: 2, contributions: 5},
            {id: 1, contributions: 17},
            {id: 3, contributions: 47},
            {id: 2, contributions: 7},
            {id: 4, contributions: 32}
        ];

        const output = [
            {id: 3, contributions: 47},
            {id: 1, contributions: 32},
            {id: 4, contributions: 32},
            {id: 2, contributions: 12}
        ];

        expect(octokit._aggregateContributors(input)).toEqual(output);
    });
});

describe("listCommentContributors()", () => {
    afterEach(() => {
        sinon.restore();
    });

    test("should call paginate with correct parameters", async () => {
        const paginateStub = sinon.stub(octokit, "paginate");
        paginateStub.resolves([]);
        const inputParams = {
            owner: "test", 
            repo: "test", 
            since: "test", 
            sort: "test", 
            direction: "test",
            per_page: 100,
            page: 5
        };

        const expectedParams = {
            owner: "test",
            repo: "test",
            since: "test"
        };

        await octokit.listCommentContributors(inputParams);

        sinon.assert.calledWith(paginateStub, octokit.issues.listCommentsForRepo, expectedParams);
    });

    test("should leave input parameters unchanged", async () => {
        sinon.stub(octokit, "paginate").resolves([]);
        const inputParams = {
            owner: "test", 
            repo: "test", 
            since: "test", 
            sort: "test", 
            direction: "test",
            per_page: 100,
            page: 5
        };

        const inputParamsCopy = {
            owner: "test", 
            repo: "test", 
            since: "test", 
            sort: "test", 
            direction: "test",
            per_page: 100,
            page: 5
        };

        await octokit.listCommentContributors(inputParams);

        expect(inputParams).toEqual(inputParamsCopy);
    });

    test("should return an empty array when there are no issue comments", async () => {
        sinon.stub(octokit, "paginate").resolves([]);
        const input = { owner: "test", repo: "test" };

        const output = [];

        expect(await octokit.listCommentContributors(input)).toEqual(output);
    });

    test("should return array of length one when there is only one comment contributor", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { id: 200, user: { id: 1 } }
        ]);

        const input = { owner: "test", repo: "test" };

        const output = [
            { id: 1, contributions: 1 }
        ];

        expect(await octokit.listCommentContributors(input)).toEqual(output);
    });

    test("should aggregate, sort, and return a list of comment contributors", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { id: 201, user: { id: 1 } },
            { id: 202, user: { id: 2 } },
            { id: 203, user: { id: 4 } },
            { id: 204, user: { id: 5 } },
            { id: 205, user: { id: 2 } },
            { id: 206, user: { id: 5 } },
            { id: 207, user: { id: 3 } },
            { id: 208, user: { id: 1 } },
            { id: 209, user: { id: 3 } },
            { id: 210, user: { id: 1 } },
            { id: 211, user: { id: 5 } },
            { id: 212, user: { id: 5 } },
        ]);

        const input = { owner: "test", repo: "test" };

        const output = [
            {id: 5, contributions: 4 },
            {id: 1, contributions: 3 },
            {id: 2, contributions: 2 },
            {id: 3, contributions: 2 },
            {id: 4, contributions: 1 },
        ];

        expect(await octokit.listCommentContributors(input)).toEqual(output);
    });
});

describe("listCommitContributors()", () => {
    afterEach(() => {
        sinon.restore();
    });

    test("should call paginate with correct parameters", async () => {
        const paginateStub = sinon.stub(octokit, "paginate");
        paginateStub.resolves([]);
        const inputParams = {
            owner: "test", 
            repo: "test", 
            sha: "test",
            path: "test",
            author: "test",
            since: "test",
            until: "test",
            per_page: 100,
            page: 1
        };

        const expectedParams = {
            owner: "test", 
            repo: "test", 
            sha: "test",
            path: "test",
            since: "test",
            until: "test"
        };

        await octokit.listCommitContributors(inputParams);

        sinon.assert.calledWith(paginateStub, octokit.repos.listCommits, expectedParams);
    });

    test("should leave input parameters unchanged", async () => {
        sinon.stub(octokit, "paginate").resolves([]);
        const inputParams = {
            owner: "test", 
            repo: "test", 
            sha: "test",
            path: "test",
            author: "test",
            since: "test",
            until: "test",
            per_page: 100,
            page: 1
        };

        const inputParamsCopy = {
            owner: "test", 
            repo: "test", 
            sha: "test",
            path: "test",
            author: "test",
            since: "test",
            until: "test",
            per_page: 100,
            page: 1
        };

        await octokit.listCommentContributors(inputParams);

        expect(inputParams).toEqual(inputParamsCopy);
    });

    test("should return array of length one when there is only one comment contributor", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { id: 200, author: { id: 1 } }
        ]);

        const input = { owner: "test", repo: "test" };

        const output = [
            { id: 1, contributions: 1 }
        ];

        expect(await octokit.listCommitContributors(input)).toEqual(output);
    });

    test("should aggregate, sort, and return a list of comment contributors", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { id: 201, author: { id: 1 } },
            { id: 202, author: { id: 2 } },
            { id: 203, author: { id: 4 } },
            { id: 204, author: { id: 5 } },
            { id: 205, author: { id: 2 } },
            { id: 206, author: { id: 5 } },
            { id: 207, author: { id: 3 } },
            { id: 208, author: { id: 1 } },
            { id: 209, author: { id: 3 } },
            { id: 210, author: { id: 1 } },
            { id: 211, author: { id: 5 } },
            { id: 212, author: { id: 5 } },
        ]);

        const input = { owner: "test", repo: "test" };

        const output = [
            {id: 5, contributions: 4 },
            {id: 1, contributions: 3 },
            {id: 2, contributions: 2 },
            {id: 3, contributions: 2 },
            {id: 4, contributions: 1 },
        ];

        expect(await octokit.listCommitContributors(input)).toEqual(output);
    });
});

describe("listCommitCommentContributors()", () => {
    afterEach(() => {
        sinon.restore();
    });

    test("should call listCommitContributors if since is provided", async () => {
        const listCommitsStub = sinon.stub(octokit, "listCommitContributors");
        const listCommentsStub = sinon.stub(octokit, "listCommentContributors");
        const paginateStub = sinon.stub(octokit, "paginate");
        listCommitsStub.resolves([]);
        listCommentsStub.resolves([]);

        const input = {
            owner: "test", 
            repo: "test", 
            since: "test"
        };

        await octokit.listCommitCommentContributors(input);

        sinon.assert.calledOnce(listCommentsStub);
        sinon.assert.calledOnce(listCommitsStub);
        sinon.assert.notCalled(paginateStub);
    });

    test("should call paginate if since is not provided", async () => {
        const listCommitsStub = sinon.stub(octokit, "listCommitContributors");
        const listCommentsStub = sinon.stub(octokit, "listCommentContributors");
        const paginateStub = sinon.stub(octokit, "paginate");
        paginateStub.resolves([]);
        listCommentsStub.resolves([]);

        const input = {
            owner: "test", 
            repo: "test"
        };

        await octokit.listCommitCommentContributors(input);

        sinon.assert.calledOnce(listCommentsStub);
        sinon.assert.calledOnce(paginateStub);
        sinon.assert.notCalled(listCommitsStub);
    });

    test("should call listCommentContributors and listCommitContributors with correct params", async () => {
        const listCommitsStub = sinon.stub(octokit, "listCommitContributors");
        const listCommentsStub = sinon.stub(octokit, "listCommentContributors");
        listCommitsStub.resolves([]);
        listCommentsStub.resolves([]);
        const input = {
            owner: "test", 
            repo: "test", 
            since: "test",
            sha: "test",
            path: "test",
            author: "test",
            until: "test",
            per_page: 100,
            page: 5
        };

        const expected = {
            owner: "test", 
            repo: "test",
            since: "test"
        };

        await octokit.listCommitCommentContributors(input);

        sinon.assert.calledWith(listCommitsStub, expected);
        sinon.assert.calledWith(listCommentsStub, expected);
    });
    
    test("should call listCommentContributors and paginate with correct params", async () => {
        const paginateStub = sinon.stub(octokit, "paginate");
        const listCommentsStub = sinon.stub(octokit, "listCommentContributors");
        paginateStub.resolves([]);
        listCommentsStub.resolves([]);
        const input = {
            owner: "test", 
            repo: "test",
            sha: "test",
            path: "test",
            author: "test",
            until: "test",
            per_page: 100,
            page: 5
        };

        const expected = {
            owner: "test", 
            repo: "test"
        };

         await octokit.listCommitCommentContributors(input);

         sinon.assert.calledWith(paginateStub, octokit.repos.listContributors, expected);
         sinon.assert.calledWith(listCommentsStub, expected);
    });

    test("should leave input parameters unchanged", async () => {
        sinon.stub(octokit, "listCommitContributors").resolves([]);
        sinon.stub(octokit, "listCommentContributors").resolves([]);
        const inputParams = {
            owner: "test", 
            repo: "test", 
            sha: "test",
            path: "test",
            author: "test",
            since: "test",
            until: "test",
            per_page: 100,
            page: 1
        };

        const inputParamsCopy = {
            owner: "test", 
            repo: "test", 
            sha: "test",
            path: "test",
            author: "test",
            since: "test",
            until: "test",
            per_page: 100,
            page: 1
        };

        await octokit.listCommitCommentContributors(inputParams);

        expect(inputParams).toEqual(inputParamsCopy);
    });

    test("should be equal with commit contributions when there are no comments", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { id: 201, contributions: 1 }
        ]);
        sinon.stub(octokit, "listCommentContributors").resolves([]);

        const input = { owner: "test", repo: "test" };

        const output = [
            { id: 201, contributions: 1 }
        ];

        expect(await octokit.listCommitCommentContributors(input)).toEqual(output);
    });

    test("should aggregate and sort commit and comment contributions", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { id: 203, contributions: 24 },
            { id: 205, contributions: 20 },
            { id: 201, contributions: 15 },
            { id: 204, contributions: 12 },
            { id: 202, contributions: 7 }
        ]);

        sinon.stub(octokit, "listCommentContributors").resolves([
            { id: 207, contributions: 9 },
            { id: 201, contributions: 3 },
            { id: 202, contributions: 2 },
            { id: 203, contributions: 2 },
            { id: 204, contributions: 1 },
            { id: 206, contributions: 1 }
        ]);

        const input = { owner: "test", repo: "test" };

        const output = [
            { id: 203, contributions: 26 },
            { id: 205, contributions: 20 },
            { id: 201, contributions: 18 },
            { id: 204, contributions: 13 },
            { id: 202, contributions: 9 },
            { id: 207, contributions: 9 },
            { id: 206, contributions: 1 },
        ];

        expect(await octokit.listCommitCommentContributors(input)).toEqual(output);
    });
});

describe("listCommentContributorsForOrg()", () => {
    afterEach(() => {
        sinon.restore();
    });

    test("should call paginate with correct parameters", async () => {
        const paginateStub = sinon.stub(octokit, "paginate");
        paginateStub.resolves([]);
        sinon.stub(octokit, "listCommentContributors").resolves([]);
        const inputParams = {
            org: "test", 
            type: "test", 
            sort: "test",
            direciton: "test",
            per_page: 100,
            page: 1
        };

        const expectedParams = {
            org: "test", 
            type: "test"
        };

        await octokit.listCommentContributorsForOrg(inputParams);

        sinon.assert.calledWith(paginateStub, octokit.repos.listForOrg, expectedParams);
    });

    test("should call listCommentContributors with correct parameters", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { owner: { login: "test" }, name: "repo1" }
        ]);
        const commentContributorsStub = sinon.stub(octokit, "listCommentContributors")
        commentContributorsStub.resolves([]);
        const inputParams = { org: "test",  type: "test", since: "test", until: "test" };

        const expectedParams = { owner: "test",  repo: "repo1", org: "test", type: "test", since: "test", until: "test" };

        await octokit.listCommentContributorsForOrg(inputParams);

        sinon.assert.calledWith(commentContributorsStub, expectedParams);
    });

    test("should call listCommentContributors correct amount of times", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { owner: { login: "test" }, name: "repo1" },
            { owner: { login: "test" }, name: "repo2" },
            { owner: { login: "test" }, name: "repo3" },
            { owner: { login: "test" }, name: "repo4" },
        ]);
        const commentContributorsStub = sinon.stub(octokit, "listCommentContributors")
        commentContributorsStub.resolves([]);
        const inputParams = { org: "test",  type: "test" };

        await octokit.listCommentContributorsForOrg(inputParams);

       sinon.assert.callCount(commentContributorsStub, 4);
    });

    test("should leave input parameters unchanged", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { owner: { login: "test" }, name: "repo1" },
            { owner: { login: "test" }, name: "repo2" },
            { owner: { login: "test" }, name: "repo3" },
            { owner: { login: "test" }, name: "repo4" },
        ]);
        sinon.stub(octokit, "listCommentContributors").resolves([
            {id: 201, contributions: 1 },
        ]);
        const inputParams = {
            org: "test", 
            type: "test", 
            sort: "test",
            direciton: "test",
            per_page: 100,
            page: 1
        };

        const inputParamsCopy = {
            org: "test", 
            type: "test", 
            sort: "test",
            direciton: "test",
            per_page: 100,
            page: 1
        };

        await octokit.listCommentContributorsForOrg(inputParams);

        expect(inputParams).toEqual(inputParamsCopy);
    });

    test("should return empty array when there are no repos", async () => {
        sinon.stub(octokit, "paginate").resolves([]);
        const input = { org: "test", type: "test" };

        const output = [];

        expect(await octokit.listCommentContributorsForOrg(input)).toEqual(output);
    });

    test("should return 1st contributor set when there is only 1 repo", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { owner: { login: "test" }, name: "repo1" }
        ]);
        sinon.stub(octokit, "listCommentContributors").resolves([
            { id: 201, contributions: 1 }
        ]);

        const input = { org: "test", type: "test" };

        const output = [
            { id: 201, contributions: 1 }
        ];

        expect(await octokit.listCommentContributorsForOrg(input)).toEqual(output);
    });

    test("should aggregate, sort, and return a list of comment contributors", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { owner: { login: "test" }, name: "repo1" },
            { owner: { login: "test" }, name: "repo2" },
            { owner: { login: "test" }, name: "repo3" },
            { owner: { login: "test" }, name: "repo4" },
        ]);
        const commentContributorsStub = sinon.stub(octokit, "listCommentContributors");
        commentContributorsStub.onCall(0).resolves([
            { id: 201, contributions: 5 },
            { id: 202, contributions: 3 },
            { id: 203, contributions: 1 }
        ]);
        commentContributorsStub.onCall(1).resolves([
            { id: 201, contributions: 7 },
            { id: 204, contributions: 5 },
            { id: 203, contributions: 2 }
        ]);
        commentContributorsStub.onCall(2).resolves([]);
        commentContributorsStub.onCall(3).resolves([
            { id: 205, contributions: 4 },
            { id: 206, contributions: 1 }
        ]);
        const input = { org: "test", type: "test" };

        const output = [
            { id: 201, contributions: 12 },
            { id: 204, contributions: 5 },
            { id: 205, contributions: 4 },
            { id: 202, contributions: 3 },
            { id: 203, contributions: 3 },
            { id: 206, contributions: 1 },
        ];

        expect(await octokit.listCommentContributorsForOrg(input)).toEqual(output);
    });

});

describe("listCommitContributorsForOrg()", () => {
    afterEach(() => {
        sinon.restore();
    });

    test("should call paginate with correct parameters", async () => {
        const paginateStub = sinon.stub(octokit, "paginate");
        paginateStub.resolves([]);
        sinon.stub(octokit, "listCommitContributors").resolves([]);
        const inputParams = {
            org: "test", 
            type: "test", 
            sort: "test",
            direciton: "test",
            per_page: 100,
            page: 1
        };

        const expectedParams = {
            org: "test", 
            type: "test"
        };

        await octokit.listCommitContributorsForOrg(inputParams);

        sinon.assert.calledWith(paginateStub, octokit.repos.listForOrg, expectedParams);
    });

    test("should call listCommitContributors with correct parameters", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { owner: { login: "test" }, name: "repo1" }
        ]);
        const commitContributorsStub = sinon.stub(octokit, "listCommitContributors")
        commitContributorsStub.resolves([]);
        const inputParams = { org: "test",  type: "test", sha: "test", path: "test", since: "test", until: "test" };

        const expectedParams = { owner: "test", repo: "repo1", org: "test",  type: "test", sha: "test", path: "test", since: "test", until: "test" };

        await octokit.listCommitContributorsForOrg(inputParams);

        sinon.assert.calledWith(commitContributorsStub, expectedParams);
    });

    test("should call listCommitContributors correct amount of times", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { owner: { login: "test" }, name: "repo1" },
            { owner: { login: "test" }, name: "repo2" },
            { owner: { login: "test" }, name: "repo3" },
            { owner: { login: "test" }, name: "repo4" },
        ]);
        const commitContributorsStub = sinon.stub(octokit, "listCommitContributors")
        commitContributorsStub.resolves([]);
        const inputParams = { org: "test",  type: "test" };

        await octokit.listCommitContributorsForOrg(inputParams);

       sinon.assert.callCount(commitContributorsStub, 4);
    });

    test("should leave input parameters unchanged", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { owner: { login: "test" }, name: "repo1" },
            { owner: { login: "test" }, name: "repo2" },
            { owner: { login: "test" }, name: "repo3" },
            { owner: { login: "test" }, name: "repo4" },
        ]);
        sinon.stub(octokit, "listCommitContributors").resolves([
            {id: 201, contributions: 1 },
        ]);
        const inputParams = {
            org: "test", 
            type: "test", 
            sort: "test",
            direciton: "test",
            per_page: 100,
            page: 1
        };

        const inputParamsCopy = {
            org: "test", 
            type: "test", 
            sort: "test",
            direciton: "test",
            per_page: 100,
            page: 1
        };

        await octokit.listCommitContributorsForOrg(inputParams);

        expect(inputParams).toEqual(inputParamsCopy);
    });

    test("should return empty array when there are no repos", async () => {
        sinon.stub(octokit, "paginate").resolves([]);
        const input = { org: "test", type: "test" };

        const output = [];

        expect(await octokit.listCommitContributorsForOrg(input)).toEqual(output);
    });

    test("should return 1st contributor set when there is only 1 repo", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { owner: { login: "test" }, name: "repo1" }
        ]);
        sinon.stub(octokit, "listCommitContributors").resolves([
            { id: 201, contributions: 1 }
        ]);

        const input = { org: "test", type: "test" };

        const output = [
            { id: 201, contributions: 1 }
        ];

        expect(await octokit.listCommitContributorsForOrg(input)).toEqual(output);
    });

    test("should aggregate, sort, and return a list of comment contributors", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { owner: { login: "test" }, name: "repo1" },
            { owner: { login: "test" }, name: "repo2" },
            { owner: { login: "test" }, name: "repo3" },
            { owner: { login: "test" }, name: "repo4" },
        ]);
        const commitContributorsStub = sinon.stub(octokit, "listCommitContributors");
        commitContributorsStub.onCall(0).resolves([
            { id: 201, contributions: 5 },
            { id: 202, contributions: 3 },
            { id: 203, contributions: 1 }
        ]);
        commitContributorsStub.onCall(1).resolves([
            { id: 201, contributions: 7 },
            { id: 204, contributions: 5 },
            { id: 203, contributions: 2 }
        ]);
        commitContributorsStub.onCall(2).resolves([]);
        commitContributorsStub.onCall(3).resolves([
            { id: 205, contributions: 4 },
            { id: 206, contributions: 1 }
        ]);
        const input = { org: "test", type: "test" };

        const output = [
            { id: 201, contributions: 12 },
            { id: 204, contributions: 5 },
            { id: 205, contributions: 4 },
            { id: 202, contributions: 3 },
            { id: 203, contributions: 3 },
            { id: 206, contributions: 1 },
        ];

        expect(await octokit.listCommitContributorsForOrg(input)).toEqual(output);
    });
});

describe("listContributorsForOrg()", () => {
    afterEach(() => {
        sinon.restore();
    });

    test("should return empty array for empty org", async () => {
        sinon.stub(octokit, "paginate").resolves([]);
        const input = { org: "test", type: "test", anon: "test"};

        const output = [];

        expect(await octokit.listContributorsForOrg(input)).toEqual(output);
    });

    test("should work with only one repo", async () => {
        const paginateStub = sinon.stub(octokit, "paginate")
        paginateStub.onCall(0).resolves([
            { owner: { login: "test" }, name: "repo1" }
        ]);
        paginateStub.onCall(1).resolves([
            { id: 1, contributions: 5 },
            { id: 2, contributions: 3 },
            { id: 3, contributions: 1 }
        ]);

        const input = { org: "test", type: "test", anon: "test" };

        const output = [
            { id: 1, contributions: 5 },
            { id: 2, contributions: 3 },
            { id: 3, contributions: 1 }
        ];

        expect(await octokit.listContributorsForOrg(input)).toEqual(output);
    });

    test("should aggregate contributors from each repo", async () => {
        const paginateStub = sinon.stub(octokit, "paginate")
        paginateStub.onCall(0).resolves([
            { owner: { login: "test" }, name: "repo1" },
            { owner: { login: "test" }, name: "repo2" },
            { owner: { login: "test" }, name: "repo3" },
            { owner: { login: "test" }, name: "repo4" }
        ]);
        paginateStub.onCall(1).resolves([
            { id: 1, contributions: 5 },
            { id: 2, contributions: 3 },
            { id: 3, contributions: 1 }
        ]);
        paginateStub.onCall(2).resolves([
            { id: 1, contributions: 7 },
            { id: 4, contributions: 5 },
            { id: 3, contributions: 2 }
        ]);
        paginateStub.onCall(3).resolves([]);
        paginateStub.onCall(4).resolves([
            { id: 5, contributions: 4 },
            { id: 6, contributions: 1 }
        ]);
        const input = { org: "test", type: "test", anon: "test" };

        const output = [
            { id: 1, contributions: 12 },
            { id: 4, contributions: 5 },
            { id: 5, contributions: 4 },
            { id: 2, contributions: 3 },
            { id: 3, contributions: 3 },
            { id: 6, contributions: 1 },
        ];

        expect(await octokit.listContributorsForOrg(input)).toEqual(output);
    });
});

describe("listCommitCommentContributorsForOrg()", () => {
    afterEach(() => {
        sinon.restore();
    });

    test("should return empty array for empty org", async () => {
        sinon.stub(octokit, "paginate").resolves([]);

        const input = { org: "test", type: "test" };

        const output = [];

        expect(await octokit.listCommitCommentContributorsForOrg(input)).toEqual(output);
    });

    test("should work with 1 repo", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { owner: { login: "test" }, name: "repo1" }
        ]);
        sinon.stub(octokit, "listCommitCommentContributors").resolves([
            {id: 1, contributions: 15},
            {id: 2, contributions: 10},
            {id: 3, contributions: 5}
        ]);

        const input = { org: "test", type: "test" };

        const output = [
            {id: 1, contributions: 15},
            {id: 2, contributions: 10},
            {id: 3, contributions: 5}
        ];

        expect(await octokit.listCommitCommentContributorsForOrg(input)).toEqual(output);
    });

    test("should aggregate commit contributions", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { owner: { login: "test" }, name: "repo1" },
            { owner: { login: "test" }, name: "repo2" },
            { owner: { login: "test" }, name: "repo3" },
            { owner: { login: "test" }, name: "repo4" }
        ]);
        const commitCommentContributorsStub = sinon.stub(octokit, "listCommitCommentContributors")
        commitCommentContributorsStub.onCall(0).resolves([
            { id: 1, contributions: 5 },
            { id: 2, contributions: 3 },
            { id: 3, contributions: 1 }
        ]);
        commitCommentContributorsStub.onCall(1).resolves([
            { id: 1, contributions: 7 },
            { id: 4, contributions: 5 },
            { id: 3, contributions: 2 }
        ]);
        commitCommentContributorsStub.onCall(2).resolves([]);
        commitCommentContributorsStub.onCall(3).resolves([
            { id: 5, contributions: 4 },
            { id: 6, contributions: 1 }
        ]);
        const input = { org: "test", type: "test" };

        const output = [
            { id: 1, contributions: 12 },
            { id: 4, contributions: 5 },
            { id: 5, contributions: 4 },
            { id: 2, contributions: 3 },
            { id: 3, contributions: 3 },
            { id: 6, contributions: 1 },
        ];

        expect(await octokit.listCommitCommentContributorsForOrg(input)).toEqual(output);
    });
});