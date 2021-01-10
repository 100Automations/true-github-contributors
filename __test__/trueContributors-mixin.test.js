const sinon = require('sinon');
const { Octokit } = require("@octokit/rest");
const trueContributors = require("../trueContributors-mixin");

Object.assign(Octokit.prototype, trueContributors);
const octokit = new Octokit();

describe("_sortByContributions()", () => {
    test("should throw error if argument has no contribution property", () => {
        const inputA = { id: 1, contributions: 15 };
        const inputB = { id: 2 };

        expect(() => octokit._sortByContributions(inputA, inputB)).toThrow();
        expect(() => octokit._sortByContributions(inputB, inputA)).toThrow();
    });

    test("should leave inputs unmodified", () => {
        const inputA = { id: 1, contributions: 16 };
        const inputB = { id: 2, contributions: 15 };

        const inputAOriginal = { id: 1, contributions: 16 };
        const inputBOriginal = { id: 2, contributions: 15 };

        octokit._sortByContributions(inputA, inputB)

        expect(inputA).toEqual(inputAOriginal);
        expect(inputB).toEqual(inputBOriginal);
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

    test("should return list of contributor objects sorted by contributions", () => {
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

describe("_reduceContributions()", () => {
    test("should throw if contributor does not have contributions property", () => {
        const input = [
            {id: 1, contributions: 15},
            {id: 2, contributions: 5},
            {id: 1},
            {id: 3, contributions: 47},
            {id: 2, contributions: 7},
            {id: 4, contributions: 32}
        ];
        
        expect(() => input.reduce(octokit._reduceContributors, {})).toThrow();
    });

    test("should throw if contributor does not have id property", () => {
        const input = [
            {id: 1, contributions: 15},
            {id: 2, contributions: 5},
            {contributions: 17},
            {id: 3, contributions: 47},
            {id: 2, contributions: 7},
            {id: 4, contributions: 32}
        ];
        
        expect(() => input.reduce(octokit._reduceContributors, {})).toThrow();
    });

    test("should return an empty dictionary for an empty list", () => {
        const input = [];

        const output = {};

        expect(input.reduce(octokit._reduceContributors, {})).toEqual(output);
    });

    test("should return a dictionary with one contributor if list with one contributors is given", () => {
        const input = [
            {id: 1, contributions: 15}
        ];

        const output = {
            1: {id: 1, contributions: 15}
        };
        
        expect(input.reduce(octokit._reduceContributors, {})).toEqual(output);
    });

    test("should reduce a set of contributors to contributor dictionary", () => {
        const input = [
            {id: 1, contributions: 15},
            {id: 2, contributions: 5},
            {id: 1, contributions: 17},
            {id: 3, contributions: 47},
            {id: 2, contributions: 7},
            {id: 4, contributions: 32}
        ];

        const output = {
            1: {id: 1, contributions: 32},
            2: {id: 2, contributions: 12},
            3: {id: 3, contributions: 47},
            4: {id: 4, contributions: 32}
        };
        
        expect(input.reduce(octokit._reduceContributors, {})).toEqual(output);
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

describe("_listContributors()" , () => {
    afterEach(() => {
        sinon.restore();
    });

    test("should throw if octokit.listContributors throws", async() => {
        const paginateError = new TypeError("Cannot use 'in' operator to search for 'total_count' in undefined");
        const listContributorsError = new Error("Error in listContributors.");
        sinon.stub(octokit, "paginate").throws(paginateError);
        sinon.stub(octokit.repos, "listContributors").throws(listContributorsError);

        const input = { owner: "test", repo: "test" };

        expect.assertions(1);
        try {
            await octokit._listContributors(input);
        } catch(error) {
            expect(error).toEqual(listContributorsError);
        }
    });

    test("should throw if octokit.listContributors returns a response not related to the unintended type error relating to empty repos", async () => {
        const paginateError = new TypeError("Cannot use 'in' operator to search for 'total_count' in undefined");
        sinon.stub(octokit, "paginate").throws(paginateError);
        sinon.stub(octokit.repos, "listContributors").resolves({ status: 401, headers: { status: "This is a random message" } });

        const input = { owner: "test", repo: "test" };

        expect.assertions(1);
        try {
            await octokit._listContributors(input);
        } catch(error) {
            expect(error).toEqual(paginateError);
        }
    });

    test("should throw if octokit.listContributors returns a response with the wrong status message", async () => {
        const paginateError = new TypeError("Cannot use 'in' operator to search for 'total_count' in undefined");
        sinon.stub(octokit, "paginate").throws(paginateError);
        sinon.stub(octokit.repos, "listContributors").resolves({ status: 204, headers: { status: "This is the wrong message" } });

        const input = { owner: "test", repo: "test" };

        expect.assertions(1);
        try {
            await octokit._listContributors(input);
        } catch(error) {
            expect(error).toEqual(paginateError);
        }
    });

    test("should throw if octokit.listContributors returns a response with wrong statuscode", async () => {
        const paginateError = new TypeError("Cannot use 'in' operator to search for 'total_count' in undefined");
        sinon.stub(octokit, "paginate").throws(paginateError);
        sinon.stub(octokit.repos, "listContributors").resolves({ status: 201, headers: { status: "204 No Content" } });

        const input = { owner: "test", repo: "test" };

        expect.assertions(1);
        try {
            await octokit._listContributors(input);
        } catch(error) {
            expect(error).toEqual(paginateError);
        }
    });

    test("should return empty list if paginate throws but listContributors returns empty repo response", async () => {
        const paginateError = new TypeError("Cannot use 'in' operator to search for 'total_count' in undefined");
        sinon.stub(octokit, "paginate").throws(paginateError);
        sinon.stub(octokit.repos, "listContributors").resolves({ status: 204, headers: { status: "204 No Content" } });

        const input = { owner: "test", repo: "test" };

        const output = [];

        expect(await octokit._listContributors(input)).toEqual(output);
    });

    test("should return an empty list of contributors if paginate returns an empty list", async () => {
        sinon.stub(octokit, "paginate").resolves([]);
        const input = { owner: "test", repo: "test" };

        const output = [];

        expect(await octokit._listContributors(input)).toEqual(output);
    });

    test("should return an list with one contributor if paginate returns a one contributor", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { id: 201, contributions: 3 }
        ]);
        const input = { owner: "test", repo: "test" };

        const output = [
            { id: 201, contributions: 3 }
        ];

        expect(await octokit._listContributors(input)).toEqual(output);
    });

    test("should return a list of contributors if paginate does not throw an error", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { id: 202, contributions: 5 },
            { id: 201, contributions: 3 },
            { id: 203, contributions: 1 }
        ]);
        const input = { owner: "test", repo: "test" };

        const output = [
            { id: 202, contributions: 5 },
            { id: 201, contributions: 3 },
            { id: 203, contributions: 1 }
        ];

        expect(await octokit._listContributors(input)).toEqual(output);
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

    test("should return an empty array when there are no commits and handle empty repo error is given", async () => {
        class EmptyRepoError extends Error {
            constructor() {
                super();
                this.status = 409;
                this.message = "Git Repository is empty.";
            }
        };
        const emptyRepoError = new EmptyRepoError();
        const paginateStub = sinon.stub(octokit, "paginate")
        paginateStub.throws(emptyRepoError);
        const input = { owner: "test", repo: "test" };

        const output = [];

        expect(await octokit.listCommitContributors(input)).toEqual(output);
        sinon.assert.threw(paginateStub, emptyRepoError);
    });

    test("should throw on error without status 409", async () => {
        sinon.stub(octokit, "paginate").throws(new Error("Git Repository is empty."));
        const input = { owner: "test", repo: "test" };

        expect.assertions(1);
        try {
            await octokit.listCommitContributors(input);
        } catch(error) {
            expect(error.message).toEqual("Git Repository is empty.")
        }
    });

    test("should throw on error without messsage 'Git Repository is empty.'", async () => {
        class statusError extends Error {
            constructor() {
                super();
                this.status = 409;
            }
        };
        sinon.stub(octokit, "paginate").throws(new statusError());
        const input = { owner: "test", repo: "test" };

        expect.assertions(1);
        try {
            await octokit.listCommitContributors(input);
        } catch(error) {
            expect(error.status).toEqual(409)
        }
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

    test("should be equal with comment contributions when there are no commits", async () => {
        sinon.stub(octokit, "listCommitContributors").resolves([]);
        sinon.stub(octokit, "listCommentContributors").resolves([
            { id: 201, contributions: 1 }
        ]);

        const input = { owner: "test", repo: "test", since: "test" };

        const output = [
            { id: 201, contributions: 1 }
        ];

        expect(await octokit.listCommitCommentContributors(input)).toEqual(output);
    });

    test("should be equal with comment contributions when there are no contributors for listContributors", async () => {
        const paginateError = new TypeError("Cannot use 'in' operator to search for 'total_count' in undefined");
        const paginateStub = sinon.stub(octokit, "paginate");
        paginateStub.throws(paginateError);
        const listContributorsStub = sinon.stub(octokit.repos, "listContributors");
        listContributorsStub.resolves({ status: 204, headers: { status: "204 No Content" } });
        sinon.stub(octokit, "listCommentContributors").resolves([
            { id: 201, contributions: 1 }
        ]);

        const input = { owner: "test", repo: "test" };

        const output = [
            { id: 201, contributions: 1 }
        ];

        expect(await octokit.listCommitCommentContributors(input)).toEqual(output);
        sinon.assert.threw(paginateStub, paginateError);
    });

    test("should throw if listCommitContributors throws an error", async () => {
        sinon.stub(octokit, "listCommitContributors").throws(new Error("Error from listCommitContributors."));
        const input = { owner: "test", repo: "test", since: "test" };

        expect.assertions(1);
        try {
            await octokit.listCommitCommentContributors(input);
        } catch(error) {
            expect(error.message).toEqual("Error from listCommitContributors.")
        }
    });

    test("should throw if response from listContributors does not have status 204", async () => {
        const paginateError = new TypeError("Cannot use 'in' operator to search for 'total_count' in undefined");
        sinon.stub(octokit, "paginate").throws(paginateError);
        sinon.stub(octokit.repos, "listContributors").resolves({ status: 200, headers: { status: "204 No Content" } });
        const input = { owner: "test", repo: "test" };

        expect.assertions(1);
        try {
            await octokit.listCommitCommentContributors(input);
        } catch(error) {
            expect(error).toEqual(paginateError);
        }
    });

    test("should throw if response from listContributors does not have header with status `204 No Content`", async () => {
        const paginateError = new TypeError("Cannot use 'in' operator to search for 'total_count' in undefined");
        sinon.stub(octokit, "paginate").throws(paginateError);
        sinon.stub(octokit.repos, "listContributors").resolves({ status: 204, headers: { status: "205 No Content" } });
        const input = { owner: "test", repo: "test" };

        expect.assertions(1);
        try {
            await octokit.listCommitCommentContributors(input);
        } catch(error) {
            expect(error).toEqual(paginateError);
        }
    });

    test("should throw if listContributors throws", async () => {
        sinon.stub(octokit, "paginate").throws(new TypeError("Cannot use 'in' operator to search for 'total_count' in undefined"));
        const listContributorsError = new Error("Error thrown from listContributors");
        sinon.stub(octokit.repos, "listContributors").throws(listContributorsError);
        const input = { owner: "test", repo: "test" };

        expect.assertions(1);
        try {
            await octokit.listCommitCommentContributors(input);
        } catch(error) {
            expect(error).toEqual(listContributorsError);
        }
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

    test("should call listForOrg paginate with correct parameters", async () => {
        const paginateStub = sinon.stub(octokit, "paginate");
        paginateStub.resolves([]);
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

        await octokit.listContributorsForOrg(inputParams);

        sinon.assert.calledWith(paginateStub, octokit.repos.listForOrg, expectedParams);
    });

    test("should call listContributors paginate with correct parameters", async () => {
        const paginateStub = sinon.stub(octokit, "paginate");
        paginateStub.onCall(0).resolves([
            { owner: { login: "test" }, name: "repo1" }
        ]);
        paginateStub.onCall(1).resolves([]);
        const inputParams = { org: "test",  type: "test", anon: "test" };

        const expectedParams = { owner: "test", repo: "repo1", org: "test",  type: "test", anon: "test" };

        await octokit.listContributorsForOrg(inputParams);

        sinon.assert.calledWithExactly(paginateStub.getCall(1), octokit.repos.listContributors, expectedParams);
    });

    test("should call listContributors paginate correct amount of times", async () => {
        const paginateStub = sinon.stub(octokit, "paginate")
        paginateStub.onCall(0).resolves([
            { owner: { login: "test" }, name: "repo1" },
            { owner: { login: "test" }, name: "repo2" },
            { owner: { login: "test" }, name: "repo3" },
            { owner: { login: "test" }, name: "repo4" },
        ]);
        paginateStub.onCall(1).resolves([]);
        paginateStub.onCall(2).resolves([]);
        paginateStub.onCall(3).resolves([]);
        paginateStub.onCall(4).resolves([]);
        const inputParams = { org: "test",  type: "test" };

        await octokit.listContributorsForOrg(inputParams);

       sinon.assert.callCount(paginateStub, 5);
    });

    test("should leave input parameters unchanged", async () => {
        const paginateStub = sinon.stub(octokit, "paginate")
        paginateStub.onCall(0).resolves([
            { owner: { login: "test" }, name: "repo1" },
            { owner: { login: "test" }, name: "repo2" },
            { owner: { login: "test" }, name: "repo3" },
            { owner: { login: "test" }, name: "repo4" },
        ]);
        paginateStub.onCall(1).resolves([ {id: 201, contributions: 1 } ]);
        paginateStub.onCall(2).resolves([ {id: 202, contributions: 1 } ]);
        paginateStub.onCall(3).resolves([ {id: 203, contributions: 1 } ]);
        paginateStub.onCall(4).resolves([ {id: 204, contributions: 1 } ]);
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

        await octokit.listContributorsForOrg(inputParams);

        expect(inputParams).toEqual(inputParamsCopy);
    });

    test("should return empty array when there are no repos", async () => {
        sinon.stub(octokit, "paginate").resolves([]);
        const input = { org: "test", type: "test" };

        const output = [];

        expect(await octokit.listContributorsForOrg(input)).toEqual(output);
    });

    test("should handle when an org has empty repository", async () => {
        const paginateError = new TypeError("Cannot use 'in' operator to search for 'total_count' in undefined");
        const paginateStub = sinon.stub(octokit, "paginate")
        paginateStub.onCall(0).resolves([
            { owner: { login: "test" }, name: "repo1" },
            { owner: { login: "test" }, name: "repo2" },
            { owner: { login: "test" }, name: "repo3" },
            { owner: { login: "test" }, name: "repo4" },
        ]);
        paginateStub.onCall(1).resolves([
            { id: 201, contributions: 5 },
            { id: 202, contributions: 3 },
            { id: 203, contributions: 1 }
        ]);
        paginateStub.onCall(2).resolves([
            { id: 201, contributions: 7 },
            { id: 204, contributions: 5 },
            { id: 203, contributions: 2 }
        ]);
        paginateStub.onCall(3).throws(paginateError);
        paginateStub.onCall(4).resolves([
            { id: 205, contributions: 4 },
            { id: 206, contributions: 1 }
        ]);
        sinon.stub(octokit.repos, "listContributors").resolves({ status: 204, headers: { status: "204 No Content" } });;
        const input = { org: "test", type: "test" };

        const output = [
            { id: 201, contributions: 12 },
            { id: 204, contributions: 5 },
            { id: 205, contributions: 4 },
            { id: 202, contributions: 3 },
            { id: 203, contributions: 3 },
            { id: 206, contributions: 1 },
        ];

        expect(await octokit.listContributorsForOrg(input)).toEqual(output);
        sinon.assert.threw(paginateStub.getCall(3), paginateError);
    });

    test("should throw if listContributors throws an error", async () => {
        const paginateStub = sinon.stub(octokit, "paginate")
        paginateStub.onCall(0).resolves([
            { owner: { login: "test" }, name: "repo1" },
            { owner: { login: "test" }, name: "repo2" },
            { owner: { login: "test" }, name: "repo3" },
            { owner: { login: "test" }, name: "repo4" },
        ]);
        paginateStub.onCall(1).resolves([
            { id: 201, contributions: 5 },
            { id: 202, contributions: 3 },
            { id: 203, contributions: 1 }
        ]);
        paginateStub.onCall(2).resolves([
            { id: 201, contributions: 7 },
            { id: 204, contributions: 5 },
            { id: 203, contributions: 2 }
        ]);
        paginateStub.onCall(3).throws(new TypeError("Cannot use 'in' operator to search for 'total_count' in undefined"));
        paginateStub.onCall(4).resolves([
            { id: 205, contributions: 4 },
            { id: 206, contributions: 1 }
        ]);
        const listContributorsError = new Error("Error in listContributors.");
        sinon.stub(octokit.repos, "listContributors").throws(listContributorsError);
        const input = { org: "test", type: "test" };

        expect.assertions(1);
        try {
            await octokit.listContributorsForOrg(input)
        } catch(error) {
            expect(error).toEqual(listContributorsError);
        }
    });

    test("should throw if response from listContributors does not have status 204", async () => {
        const paginateStub = sinon.stub(octokit, "paginate");
        const paginateError = new TypeError("Cannot use 'in' operator to search for 'total_count' in undefined")
        paginateStub.onCall(0).resolves([
            { owner: { login: "test" }, name: "repo1" },
            { owner: { login: "test" }, name: "repo2" },
            { owner: { login: "test" }, name: "repo3" },
            { owner: { login: "test" }, name: "repo4" },
        ]);
        paginateStub.onCall(1).resolves([
            { id: 201, contributions: 5 },
            { id: 202, contributions: 3 },
            { id: 203, contributions: 1 }
        ]);
        paginateStub.onCall(2).resolves([
            { id: 201, contributions: 7 },
            { id: 204, contributions: 5 },
            { id: 203, contributions: 2 }
        ]);
        paginateStub.onCall(3).throws(paginateError);
        paginateStub.onCall(4).resolves([
            { id: 205, contributions: 4 },
            { id: 206, contributions: 1 }
        ]);
        sinon.stub(octokit.repos, "listContributors").resolves({ status: 205, headers: { status: "204 No Content" } });
        const input = { owner: "test", repo: "test" };

        expect.assertions(1);
        try {
            await octokit.listContributorsForOrg(input);
        } catch(error) {
            expect(error).toEqual(paginateError);
        }
    });

    test("should throw if response from listContributors does not have header with status `204 No Content`", async () => {
        const paginateStub = sinon.stub(octokit, "paginate");
        const paginateError = new TypeError("Cannot use 'in' operator to search for 'total_count' in undefined")
        paginateStub.onCall(0).resolves([
            { owner: { login: "test" }, name: "repo1" },
            { owner: { login: "test" }, name: "repo2" },
            { owner: { login: "test" }, name: "repo3" },
            { owner: { login: "test" }, name: "repo4" },
        ]);
        paginateStub.onCall(1).resolves([
            { id: 201, contributions: 5 },
            { id: 202, contributions: 3 },
            { id: 203, contributions: 1 }
        ]);
        paginateStub.onCall(2).resolves([
            { id: 201, contributions: 7 },
            { id: 204, contributions: 5 },
            { id: 203, contributions: 2 }
        ]);
        paginateStub.onCall(3).throws(paginateError);
        paginateStub.onCall(4).resolves([
            { id: 205, contributions: 4 },
            { id: 206, contributions: 1 }
        ]);
        sinon.stub(octokit.repos, "listContributors").resolves({ status: 204, headers: { status: "205 No Content" } });
        const input = { owner: "test", repo: "test" };

        expect.assertions(1);
        try {
            await octokit.listContributorsForOrg(input);
        } catch(error) {
            expect(error).toEqual(paginateError);
        }
    });

    test("should return 1st contributor set when there is only 1 repo", async () => {
        const paginateStub = sinon.stub(octokit, "paginate")
        paginateStub.onCall(0).resolves([
            { owner: { login: "test" }, name: "repo1" }
        ]);
        paginateStub.onCall(1).resolves([
            { id: 201, contributions: 1 }
        ]);

        const input = { org: "test", type: "test" };

        const output = [
            { id: 201, contributions: 1 }
        ];

        expect(await octokit.listContributorsForOrg(input)).toEqual(output);
    });

    test("should aggregate, sort, and return a list of comment contributors", async () => {
        const paginateStub = sinon.stub(octokit, "paginate")
        paginateStub.onCall(0).resolves([
            { owner: { login: "test" }, name: "repo1" },
            { owner: { login: "test" }, name: "repo2" },
            { owner: { login: "test" }, name: "repo3" },
            { owner: { login: "test" }, name: "repo4" },
        ]);
        paginateStub.onCall(1).resolves([
            { id: 201, contributions: 5 },
            { id: 202, contributions: 3 },
            { id: 203, contributions: 1 }
        ]);
        paginateStub.onCall(2).resolves([
            { id: 201, contributions: 7 },
            { id: 204, contributions: 5 },
            { id: 203, contributions: 2 }
        ]);
        paginateStub.onCall(3).resolves([]);
        paginateStub.onCall(4).resolves([
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

        expect(await octokit.listContributorsForOrg(input)).toEqual(output);
    });
});

describe("listCommitCommentContributorsForOrg()", () => {
    afterEach(() => {
        sinon.restore();
    });

    test("should call paginate with correct parameters", async () => {
        const paginateStub = sinon.stub(octokit, "paginate");
        paginateStub.resolves([]);
        sinon.stub(octokit, "listCommitCommentContributors").resolves([]);
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

        await octokit.listCommitCommentContributorsForOrg(inputParams);

        sinon.assert.calledWith(paginateStub, octokit.repos.listForOrg, expectedParams);
    });

    test("should call listCommitCommentContributors with correct parameters", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { owner: { login: "test" }, name: "repo1" }
        ]);
        const commitCommentContributorsStub = sinon.stub(octokit, "listCommitCommentContributors");
        commitCommentContributorsStub.resolves([]);
        const inputParams = { org: "test",  type: "test", since: "test" };

        const expectedParams = { owner: "test", repo: "repo1", org: "test",  type: "test", since: "test" };

        await octokit.listCommitCommentContributorsForOrg(inputParams);

        sinon.assert.calledWith(commitCommentContributorsStub, expectedParams);
    });

    test("should call listCommitCommentContributors correct amount of times", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { owner: { login: "test" }, name: "repo1" },
            { owner: { login: "test" }, name: "repo2" },
            { owner: { login: "test" }, name: "repo3" },
            { owner: { login: "test" }, name: "repo4" },
        ]);
        const commitCommentContributorsStub = sinon.stub(octokit, "listCommitCommentContributors")
        commitCommentContributorsStub.resolves([]);
        const inputParams = { org: "test",  type: "test" };

        await octokit.listCommitCommentContributorsForOrg(inputParams);

       sinon.assert.callCount(commitCommentContributorsStub, 4);
    });

    test("should leave input parameters unchanged", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { owner: { login: "test" }, name: "repo1" },
            { owner: { login: "test" }, name: "repo2" },
            { owner: { login: "test" }, name: "repo3" },
            { owner: { login: "test" }, name: "repo4" },
        ]);
        sinon.stub(octokit, "listCommitCommentContributors").resolves([
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

        await octokit.listCommitCommentContributorsForOrg(inputParams);

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
        sinon.stub(octokit, "listCommitCommentContributors").resolves([
            { id: 201, contributions: 1 }
        ]);

        const input = { org: "test", type: "test" };

        const output = [
            { id: 201, contributions: 1 }
        ];

        expect(await octokit.listCommitCommentContributorsForOrg(input)).toEqual(output);
    });

    test("should aggregate, sort, and return a list of comment contributors", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { owner: { login: "test" }, name: "repo1" },
            { owner: { login: "test" }, name: "repo2" },
            { owner: { login: "test" }, name: "repo3" },
            { owner: { login: "test" }, name: "repo4" },
        ]);
        const commitCommentContributorsStub = sinon.stub(octokit, "listCommitCommentContributors");
        commitCommentContributorsStub.onCall(0).resolves([
            { id: 201, contributions: 5 },
            { id: 202, contributions: 3 },
            { id: 203, contributions: 1 }
        ]);
        commitCommentContributorsStub.onCall(1).resolves([
            { id: 201, contributions: 7 },
            { id: 204, contributions: 5 },
            { id: 203, contributions: 2 }
        ]);
        commitCommentContributorsStub.onCall(2).resolves([]);
        commitCommentContributorsStub.onCall(3).resolves([
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

        expect(await octokit.listCommitCommentContributorsForOrg(input)).toEqual(output);
    });
});