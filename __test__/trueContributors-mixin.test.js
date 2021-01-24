const sinon = require('sinon');
const { Octokit } = require("@octokit/rest");
const trueContributors = require("../trueContributors-mixin");

Object.assign(Octokit.prototype, trueContributors);
const octokit = new Octokit();

describe("_sortByContributions()", () => {
    test("should throw error if argument has no contribution property", () => {
        const inputA = { id: 1, contributions: 16 };
        const inputB = { id: 2 };
        const noContrError = new ReferenceError("Error: tried to sort by contributions while object has no contribution property.");

        expect.assertions(4);
        try {
            octokit._sortByContributions(inputA, inputB)
        } catch(error) {
            expect(error).toBeInstanceOf(ReferenceError);
            expect(error).toEqual(noContrError);
        }

        try {
            octokit._sortByContributions(inputB, inputA)
        } catch(error) {
            expect(error).toBeInstanceOf(ReferenceError);
            expect(error).toEqual(noContrError);
        }
    });

    test("should throw error if argument contribution property is not a string", () => {
        const inputA = { id: 1, contributions: 16 };
        const inputB = { id: 2, contributions: "test" };
        const contrError = new TypeError("Error: tried to sort by contributions while object contribution property is not a number.");

        expect.assertions(4);
        try {
            octokit._sortByContributions(inputA, inputB)
        } catch(error) {
            expect(error).toBeInstanceOf(TypeError);
            expect(error).toEqual(contrError);
        }

        try {
            octokit._sortByContributions(inputB, inputA)
        } catch(error) {
            expect(error).toBeInstanceOf(TypeError);
            expect(error).toEqual(contrError);
        }
    });

    test("should leave inputs unmodified", () => {
        const inputA = { id: 1, contributions: 16, testParam: "testParamA" };
        const inputB = { id: 2, contributions: 15, testParam: "testParamB" };

        const inputAOriginal = { id: 1, contributions: 16, testParam: "testParamA" };
        const inputBOriginal = { id: 2, contributions: 15, testParam: "testParamB" };

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
        const inputA = { id: 1, contributions: 16 };
        const inputB = { id: 2, contributions: 15 };

        expect(octokit._sortByContributions(inputB, inputA)).toBeGreaterThan(0);
    });

    test("should return 0 when a is equal to b", () => {
        const inputA = { id: 1, contributions: 16 };

        expect(octokit._sortByContributions(inputA, inputA)).toBe(0);
    });
});

describe("_contributorDictToArr()", () => {
    test("should throw if dict is undefined", () => {
        const emptyDictError = new ReferenceError("Error: user dictionary is not defined.");

        expect.assertions(2);
        try {
            octokit._contributorDictToArr();
        } catch(error) {
            expect(error).toBeInstanceOf(ReferenceError);
            expect(error).toEqual(emptyDictError);
        }
    });

    test("should leave original input unmodified", () => {
        const input = {
            1: {id: 1, contributions: 15, testParam: "testParam1"},
            4: {id: 4, contributions: 6, testParam: "testParam4"},
            2: {id: 2, contributions: 7, testParam: "testParam2"},
            5: {id: 5, contributions: 7, testParam: "testParam5"},
            3: {id: 3, contributions: 24, testParam: "testParam3"}
        };
        const originalInput = {
            1: {id: 1, contributions: 15, testParam: "testParam1"},
            4: {id: 4, contributions: 6, testParam: "testParam4"},
            2: {id: 2, contributions: 7, testParam: "testParam2"},
            5: {id: 5, contributions: 7, testParam: "testParam5"},
            3: {id: 3, contributions: 24, testParam: "testParam3"}
        };

        octokit._contributorDictToArr(input);
        expect(input).toEqual(originalInput);
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
            4: {id: 4, contributions: 6},
            2: {id: 2, contributions: 7},
            3: {id: 3, contributions: 24},
            5: {id: 5, contributions: 7},
            1: {id: 1, contributions: 15}
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
    test("should return an empty object if given parameter object is empty", () => {
        const desiredParameters = ["desiredParam1", "desiredParam2", "desiredParam3"];
        const givenObject = {};

        const output = {};

        expect(octokit._createParamsFromObject(desiredParameters, givenObject)).toEqual(output);
    });

    test("should return an empty object if desired params list is empty", () => {
        const desiredParameters = [];
        const givenObject = {
            randomParam1: "value",
            randomParam2: "value",
            randomParam3: "value"
        };

        const output = {};

        expect(octokit._createParamsFromObject(desiredParameters, givenObject)).toEqual(output);
    });

    test("given parameters object and desired params array should be unchanged", () => {
        const desiredParameters = ["desiredParam1", "desiredParam2", "desiredParam3"];
        const originalDesiredParameters = ["desiredParam1", "desiredParam2", "desiredParam3"];
        const givenObject = {
            desiredParam1: "value1",
            randomParam1: "value2",
            desiredParam2: "value3",
            randomParam2: "value4",
            desiredParam3: "value5",
            randomParam3: "value6"
        };
        const givenObjectOriginal = {
            desiredParam1: "value1",
            randomParam1: "value2",
            desiredParam2: "value3",
            randomParam2: "value4",
            desiredParam3: "value5",
            randomParam3: "value6"
        };

        octokit._createParamsFromObject(desiredParameters, givenObject);

        expect(givenObject).toEqual(givenObjectOriginal);
        expect(desiredParameters).toEqual(originalDesiredParameters);
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

    test("should return dictionary of size 1 if given desirerd param array of size 1", () => {
        const desiredParameters = ["desiredParam1"];
        const givenObject = {
            desiredParam1: "value",
            randomParam2: "value",
            randomParam3: "value"
        };

        const output = {
            desiredParam1: "value"
        };

        expect(octokit._createParamsFromObject(desiredParameters, givenObject)).toEqual(output);
    });

    test("should return dictionary of size 1 if given parameters dictionary is of size 1", () => {
        const desiredParameters = ["desiredParam1", "desiredParam2", "desiredParam3"];
        const givenObject = {
            desiredParam1: "value"
        };

        const output = {
            desiredParam1: "value"
        };

        expect(octokit._createParamsFromObject(desiredParameters, givenObject)).toEqual(output);
    });

    test("should create desired list of params", () => {
        const desiredParameters = ["desiredParam1", "desiredParam2", "desiredParam3"];
        const givenObject = {
            desiredParam1: "value1",
            randomParam1: "value2",
            desiredParam2: "value3",
            randomParam2: "value4",
            desiredParam3: "value5",
            randomParam3: "value6"
        };

        const output = {
            desiredParam1: "value1",
            desiredParam2: "value3",
            desiredParam3: "value5"
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
        const noContrError = new ReferenceError(`Error: contributor {"id":1} has no property: contributions.`);

        expect.assertions(2);
        try {
            input.reduce(octokit._reduceContributors, {});
        } catch(error) {
            expect(error).toBeInstanceOf(ReferenceError);
            expect(error).toEqual(noContrError);
        }
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
        const noIdError = new ReferenceError(`Error: contributor {"contributions":17} has no property: id.`);

        expect.assertions(2);
        try {
            input.reduce(octokit._reduceContributors, {});
        } catch(error) {
            expect(error).toBeInstanceOf(ReferenceError);
            expect(error).toEqual(noIdError);
        }
    });

    test("should leave input unmodified", () => {
        const input = [
            {id: 1, contributions: 15},
            {id: 2, contributions: 5},
            {id: 1, contributions: 17},
            {id: 3, contributions: 47},
            {id: 2, contributions: 7},
            {id: 4, contributions: 32}
        ];
        const originalInput = [
            {id: 1, contributions: 15},
            {id: 2, contributions: 5},
            {id: 1, contributions: 17},
            {id: 3, contributions: 47},
            {id: 2, contributions: 7},
            {id: 4, contributions: 32}
        ];

        input.reduce(octokit._reduceContributors, {});
        expect(input).toEqual(originalInput);
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

describe("_aggregateContributors()", () => {
    test("should throw if contributor has no id property", () => {
        const input = [
            {id: 1, contributions: 5},
            {id: 2, contributions: 2},
            {contributions: 10}
        ];
        const noIdError = new ReferenceError(`Error: contributor {"contributions":10} has no property: id.`);

        expect.assertions(2);
        try {
            input.reduce(octokit._aggregateContributors(input));
        } catch(error) {
            expect(error).toBeInstanceOf(ReferenceError);
            expect(error).toEqual(noIdError);
        }
    });

    test("should throw if contributor has no contributions property", () => {
        const input = [
            {id: 1, contributions: 5},
            {id: 2, contributions: 2},
            {id: 3}
        ];
        const noContrError = new ReferenceError(`Error: contributor {"id":3} has no property: contributions.`);

        expect.assertions(2);
        try {
            input.reduce(octokit._aggregateContributors(input));
        } catch(error) {
            expect(error).toBeInstanceOf(ReferenceError);
            expect(error).toEqual(noContrError);
        }
    });

    test("should leave input unmodified", () => {
        const input = [
            {id: 4, contributions: 32, testProp: "testProp1"},
            {id: 1, contributions: 15, testProp: "testProp2"},
            {id: 2, contributions: 5, testProp: "testProp3"},
            {id: 1, contributions: 17, testProp: "testProp4"},
            {id: 3, contributions: 47, testProp: "testProp5"},
            {id: 2, contributions: 7, testProp: "testProp6"},
        ];

        const originalInput = [
            {id: 4, contributions: 32, testProp: "testProp1"},
            {id: 1, contributions: 15, testProp: "testProp2"},
            {id: 2, contributions: 5, testProp: "testProp3"},
            {id: 1, contributions: 17, testProp: "testProp4"},
            {id: 3, contributions: 47, testProp: "testProp5"},
            {id: 2, contributions: 7, testProp: "testProp6"},
        ];

        octokit._aggregateContributors(input);

        expect(input).toEqual(originalInput);
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

    test("should return list of 1 contributor if given 1 contributor", () => {
        const input = [
            {id: 1, contributions: 15}
        ];

        const output = [
            {id: 1, contributions: 15}
        ];

        expect(octokit._aggregateContributors(input)).toEqual(output);
    });

    test("should aggregate a list of contributors", () => {
        const input = [
            {id: 4, contributions: 32},
            {id: 1, contributions: 15},
            {id: 2, contributions: 5},
            {id: 1, contributions: 17},
            {id: 3, contributions: 47},
            {id: 2, contributions: 7}
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

describe("_aggregateContributions()", () => {
    test("should throw if input identifier not given", () => {
        const input = [];
        const noIdError = new ReferenceError("Error: no contribution identifier was given to _aggregateContributions.");

        expect.assertions(2);
        try {
            octokit._aggregateContributions(input);
        } catch(error) {
            expect(error).toBeInstanceOf(ReferenceError);
            expect(error).toEqual(noIdError);
        }
    });

    test("should throw if input identifier does not exist for contribution", () => {
        const input = [
            { body: "test body", user: { id: 1 } },
            { body: "test body", user: { id: 2 } },
            { body: "test body" },
            { body: "test body", user: { id: 4 } },
            { body: "test body", user: { id: 5 } },
        ];
        const inputIdentifier = "user";
        const noIdError = new ReferenceError(`Error: contribution {"body":"test body"} has no property user.`);

        expect.assertions(2);
        try {
            octokit._aggregateContributions(input, inputIdentifier);
        } catch(error) {
            expect(error).toBeInstanceOf(ReferenceError);
            expect(error).toEqual(noIdError);
        }
    });

    test("should leave input unmodified", () => {
        const input = [
            { body: "test body", testProp: "testProp1", user: { id: 1, testProp: "testProp8" } },
            { body: "test body", testProp: "testProp2", user: { id: 1, testProp: "testProp9" } },
            { body: "test body", testProp: "testProp3", user: { id: 2, testProp: "testProp10" } },
            { body: "test body", testProp: "testProp4", user: { id: 3, testProp: "testProp11" } },
            { body: "test body", testProp: "testProp5", user: { id: 2, testProp: "testProp12" } },
            { body: "test body", testProp: "testProp6", user: { id: 2, testProp: "testProp13" } },
            { body: "test body", testProp: "testProp7", user: { id: 4, testProp: "testProp14" } },
        ];
        const inputIdentifier = "user";

        const originalInput = [
            { body: "test body", testProp: "testProp1", user: { id: 1, testProp: "testProp8" } },
            { body: "test body", testProp: "testProp2", user: { id: 1, testProp: "testProp9" } },
            { body: "test body", testProp: "testProp3", user: { id: 2, testProp: "testProp10" } },
            { body: "test body", testProp: "testProp4", user: { id: 3, testProp: "testProp11" } },
            { body: "test body", testProp: "testProp5", user: { id: 2, testProp: "testProp12" } },
            { body: "test body", testProp: "testProp6", user: { id: 2, testProp: "testProp13" } },
            { body: "test body", testProp: "testProp7", user: { id: 4, testProp: "testProp14" } },
        ];

        octokit._aggregateContributions(input, inputIdentifier);

        expect(input).toEqual(originalInput);
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

    test("should return sorted list of contributors when there are no duplicate contributors", () => {
        const input = [
            { body: "test body", user: { id: 5 } },
            { body: "test body", user: { id: 1 } },
            { body: "test body", user: { id: 2 } },
            { body: "test body", user: { id: 3 } },
            { body: "test body", user: { id: 4 } },
        ];
        const inputIdentifier = "user";

        const output = [
            { id: 1, contributions: 1 },
            { id: 2, contributions: 1 },
            { id: 3, contributions: 1 },
            { id: 4, contributions: 1 },
            { id: 5, contributions: 1 }
        ];

        expect(octokit._aggregateContributions(input, inputIdentifier)).toEqual(output);
    });

    test("should aggregate contributions and return sorted list of contributors", () => {
        const input = [
            { body: "test body", user: { id: 5 } },
            { body: "test body", user: { id: 1 } },
            { body: "test body", user: { id: 1 } },
            { body: "test body", user: { id: 2 } },
            { body: "test body", user: { id: 5 } },
            { body: "test body", user: { id: 3 } },
            { body: "test body", user: { id: 2 } },
            { body: "test body", user: { id: 2 } },
            { body: "test body", user: { id: 4 } },
        ];
        const inputIdentifier = "user";

        const output = [
            { id: 2, contributions: 3 },
            { id: 1, contributions: 2 },
            { id: 5, contributions: 2 },
            { id: 3, contributions: 1 },
            { id: 4, contributions: 1 }
        ];

        expect(octokit._aggregateContributions(input, inputIdentifier)).toEqual(output);
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

    test("should throw if octokit.listContributors returns a response with unexpected status message", async () => {
        const paginateError = new TypeError("Cannot use 'in' operator to search for 'total_count' in undefined");
        sinon.stub(octokit, "paginate").throws(paginateError);
        sinon.stub(octokit.repos, "listContributors").resolves({ status: 204, headers: { status: "This is a random message" } });

        const input = { owner: "test", repo: "test" };

        expect.assertions(1);
        try {
            await octokit._listContributors(input);
        } catch(error) {
            expect(error).toEqual(paginateError);
        }
    });

    test("should throw if octokit.listContributors returns a response with unexpected status code", async () => {
        const paginateError = new TypeError("Cannot use 'in' operator to search for 'total_count' in undefined");
        sinon.stub(octokit, "paginate").throws(paginateError);
        sinon.stub(octokit.repos, "listContributors").resolves({ status: 200, headers: { status: "204 No Content" } });

        const input = { owner: "test", repo: "test" };

        expect.assertions(1);
        try {
            await octokit._listContributors(input);
        } catch(error) {
            expect(error).toEqual(paginateError);
        }
    });

    test("should leave input params unchanged when no paginate error thrown", async () => {
        sinon.stub(octokit, "paginate").resolves([
            { id: 202, contributions: 5 },
            { id: 201, contributions: 3 },
            { id: 203, contributions: 1 }
        ]);
        const input = { owner: "param1", repo: "param2", testParam: "testParam3" };
        const originalInput = { owner: "param1", repo: "param2", testParam: "testParam3" };

        await octokit._listContributors(input);
        expect(input).toEqual(originalInput);
    });

    test("should leave input params unchanged when paginate error thrown", async () => {
        const paginateError = new TypeError("Cannot use 'in' operator to search for 'total_count' in undefined");
        sinon.stub(octokit, "paginate").throws(paginateError);
        sinon.stub(octokit.repos, "listContributors").resolves({ status: 204, headers: { status: "204 No Content" } });
        
        const input = { owner: "param1", repo: "param2", testParam: "testParam3" };
        const originalInput = { owner: "param1", repo: "param2", testParam: "testParam3" };

        await octokit._listContributors(input);
        expect(input).toEqual(originalInput);
    });

    test("should return empty list if paginate throws but listContributors returns empty repo response", async () => {
        const paginateError = new TypeError("Cannot use 'in' operator to search for 'total_count' in undefined");
        sinon.stub(octokit, "paginate").throws(paginateError);
        sinon.stub(octokit.repos, "listContributors").resolves({ status: 204, headers: { status: "204 No Content" } });

        const input = { owner: "test", repo: "test" };

        const output = [];

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

describe("_listForOrgHelper()", () => {
    afterEach(() => {
        sinon.restore();
    });

    test("should throw if given unexpected endpoint", async() => {
        const params = { org: "test", type: "test" };
        const endpoint = octokit._aggregateContributions;
        const unexpectedEndpointError = new TypeError("Unexpected endpoint function provided.");

        expect.assertions(2);
        try {
            await octokit._listForOrgHelper(endpoint, params);
        } catch (error) {
            expect(error).toBeInstanceOf(TypeError);
            expect(error).toEqual(unexpectedEndpointError);
        }
    });

    test("should leave input unchanged", async() => {
        sinon.stub(octokit, "listCommentContributors").resolves([
            {id: 1, contributions: 1 },
            {id: 2, contributions: 1 },
            {id: 3, contributions: 1 },
            {id: 4, contributions: 1 },
            {id: 5, contributions: 1 },
        ]);

        const params = {org: "test org", type: "test type", randamParam: "randamValue"};
        const endpoint = octokit.listCommentContributors;
        const paramsOriginal = {org: "test org", type: "test type", randamParam: "randamValue"};
        const endpointOriginal = octokit.listCommentContributors;

        sinon.stub(octokit, "paginate").resolves([
            { owner: { login: "test owner" }, name: "repo1" },
            { owner: { login: "test owner" }, name: "repo2" },
            { owner: { login: "test owner" }, name: "repo3" },
            { owner: { login: "test owner" }, name: "repo4" },
        ]);

        await octokit._listForOrgHelper(endpoint, params);

        expect(params).toEqual(paramsOriginal);
        expect(endpoint).toEqual(endpointOriginal);
    });

    test("should return empty array if there are no repos", async() => {
        const endpoint = octokit.listCommentContributors;
        const params = { org: "test", type: "test" };
        const output = [];

        sinon.stub(octokit, "paginate").resolves([]);

        expect(await octokit._listForOrgHelper(endpoint, params)).toEqual(output);
    });

    test("should aggregate contributors from repos using the given endpoint function", async() => {
        sinon.stub(octokit, "paginate").resolves([
            { owner: { login: "test" }, name: "repo1" },
            { owner: { login: "test" }, name: "repo2" },
            { owner: { login: "test" }, name: "repo3" },
            { owner: { login: "test" }, name: "repo4" },
        ]);
        const listCommentContributorsStub = sinon.stub(octokit, "listCommentContributors");
        listCommentContributorsStub.onCall(0).resolves([
            { id: 201, contributions: 5 },
            { id: 202, contributions: 3 },
            { id: 203, contributions: 1 }
        ]);
        listCommentContributorsStub.onCall(1).resolves([
            { id: 201, contributions: 7 },
            { id: 204, contributions: 5 },
            { id: 203, contributions: 2 }
        ]);
        listCommentContributorsStub.onCall(2).resolves([]);
        listCommentContributorsStub.onCall(3).resolves([
            { id: 205, contributions: 4 },
            { id: 206, contributions: 1 }
        ]);

        const endpoint = octokit.listCommentContributors;
        const params = { org: "test", type: "test" };
        const output = [
            { id: 201, contributions: 12 },
            { id: 204, contributions: 5 },
            { id: 205, contributions: 4 },
            { id: 202, contributions: 3 },
            { id: 203, contributions: 3 },
            { id: 206, contributions: 1 },
        ];

        expect(await octokit._listForOrgHelper(endpoint, params)).toEqual(output);
    });

    test("should recognize the correct contributor fetching methods", async () => {
        sinon.stub(octokit, "paginate").resolves([]);
        const params = { org: "test", type: "test" };

        expect(await octokit._listForOrgHelper(octokit.listCommentContributors, params)).toEqual([]);
        expect(await octokit._listForOrgHelper(octokit.listCommitContributors, params)).toEqual([]);
        expect(await octokit._listForOrgHelper(octokit._listContributors, params)).toEqual([]);
        expect(await octokit._listForOrgHelper(octokit.listCommitCommentContributors, params)).toEqual([]);
    });
});

describe("listCommentContributors()", () => {
    afterEach(() => {
        sinon.restore();
    });

    test("should leave input parameters unchanged", async () => {
        sinon.stub(octokit, "paginate").resolves([]);
        const inputParams = {
            owner: "test owner", 
            repo: "test repo", 
            since: "test since", 
            sort: "test sort", 
            direction: "test direction",
            per_page: 100,
            page: 5
        };

        const inputParamsCopy = {
            owner: "test owner", 
            repo: "test repo", 
            since: "test since", 
            sort: "test sort", 
            direction: "test direction",
            per_page: 100,
            page: 5
        };

        await octokit.listCommentContributors(inputParams);

        expect(inputParams).toEqual(inputParamsCopy);
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

    test("should call paginate with correct parameters", async () => {
        const paginateStub = sinon.stub(octokit, "paginate");
        paginateStub.resolves([]);
        const inputParams = {
            owner: "test owner", 
            repo: "test repo", 
            since: "test since", 
            sort: "test", 
            direction: "test",
            per_page: 100,
            page: 5
        };

        const expectedParams = {
            owner: "test owner",
            repo: "test repo",
            since: "test since"
        };

        await octokit.listCommentContributors(inputParams);

        sinon.assert.calledWith(paginateStub, octokit.issues.listCommentsForRepo, expectedParams);
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
});

describe("listCommitContributors()", () => {
    afterEach(() => {
        sinon.restore();
    });

    test("should throw on paginate error with unexpected error message", async () => {
        class statusError extends Error {
            constructor() {
                super();
                this.status = 409;
                this.message = "Unexpected error message.";
            }
        };
        const paginateError = new statusError;
        sinon.stub(octokit, "paginate").throws(paginateError);
        const input = { owner: "test", repo: "test" };

        expect.assertions(1);
        try {
            await octokit.listCommitContributors(input);
        } catch(error) {
            expect(error).toBe(paginateError);
        }
    });

    test("should throw on error without status 409", async () => {
        class statusError extends Error {
            constructor() {
                super();
                this.status = 400;
                this.message = "Git Repository is empty.";
            }
        };
        const paginateError = new statusError;
        sinon.stub(octokit, "paginate").throws(paginateError);
        const input = { owner: "test", repo: "test" };

        expect.assertions(1);
        try {
            await octokit.listCommitContributors(input);
        } catch(error) {
            expect(error).toBe(paginateError);
        }
    });

    test("should leave input parameters unchanged", async () => {
        sinon.stub(octokit, "paginate").resolves([]);
        const inputParams = {
            owner: "test owner", 
            repo: "test repo", 
            sha: "test sha",
            path: "test path",
            author: "test author",
            since: "test since",
            until: "test until",
            per_page: 100,
            page: 1
        };

        const inputParamsCopy = {
            owner: "test owner", 
            repo: "test repo", 
            sha: "test sha",
            path: "test path",
            author: "test author",
            since: "test since",
            until: "test until",
            per_page: 100,
            page: 1
        };

        await octokit.listCommentContributors(inputParams);

        expect(inputParams).toEqual(inputParamsCopy);
    });

    test("should return an empty array when empty repo error is given", async () => {
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

    test("should aggregate, sort, and return a list of commit contributors", async () => {
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

    test("should call paginate with correct parameters", async () => {
        const paginateStub = sinon.stub(octokit, "paginate");
        paginateStub.resolves([]);
        const inputParams = {
            owner: "test owner", 
            repo: "test repo", 
            sha: "test sha",
            path: "test path",
            author: "test author",
            since: "test since",
            until: "test until",
            per_page: 100,
            page: 1
        };

        const expectedParams = {
            owner: "test owner", 
            repo: "test repo", 
            sha: "test sha",
            path: "test path",
            since: "test since",
            until: "test until"
        };

        await octokit.listCommitContributors(inputParams);

        sinon.assert.calledWith(paginateStub, octokit.repos.listCommits, expectedParams);
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
});

describe("listCommitCommentContributors()", () => {
    afterEach(() => {
        sinon.restore();
    });

    test("should call listCommitContributors if since is provided", async () => {
        const listCommitsStub = sinon.stub(octokit, "listCommitContributors");
        const _listContributorsStub = sinon.stub(octokit, "_listContributors");
        listCommitsStub.resolves([]);
        sinon.stub(octokit, "listCommentContributors").resolves([]);

        const input = {
            owner: "test", 
            repo: "test", 
            since: "test"
        };

        await octokit.listCommitCommentContributors(input);

        sinon.assert.calledOnce(listCommitsStub);
        sinon.assert.calledWith(listCommitsStub, input);
        sinon.assert.notCalled(_listContributorsStub);
    });

    test("should call _listContributors if since is not provided", async () => {
        const listCommitsStub = sinon.stub(octokit, "listCommitContributors");
        const _listContributorsStub = sinon.stub(octokit, "_listContributors");
        _listContributorsStub.resolves([]);
        sinon.stub(octokit, "listCommentContributors").resolves([]);

        const input = {
            owner: "test", 
            repo: "test"
        };

        await octokit.listCommitCommentContributors(input);

        sinon.assert.calledOnce(_listContributorsStub);
        sinon.assert.calledWith(_listContributorsStub, input);
        sinon.assert.notCalled(listCommitsStub);
    });

    test("should leave input parameters unchanged when 'since' is provided", async () => {
        sinon.stub(octokit, "listCommitContributors").resolves([]);
        sinon.stub(octokit, "listCommentContributors").resolves([]);
        const inputParams = {
            owner: "test owner", 
            repo: "test repo", 
            sha: "test sha",
            path: "test path",
            author: "test author",
            since: "test since",
            until: "test until",
            per_page: 100,
            page: 1
        };

        const inputParamsCopy = {
            owner: "test owner", 
            repo: "test repo", 
            sha: "test sha",
            path: "test path",
            author: "test author",
            since: "test since",
            until: "test until",
            per_page: 100,
            page: 1
        };

        await octokit.listCommitCommentContributors(inputParams);

        expect(inputParams).toEqual(inputParamsCopy);
    });

    test("should leave input parameters unchanged whithout 'since' provided", async () => {
        sinon.stub(octokit, "_listContributors").resolves([]);
        sinon.stub(octokit, "listCommentContributors").resolves([]);
        const inputParams = {
            owner: "test owner", 
            repo: "test repo", 
            sha: "test sha",
            path: "test path",
            author: "test author",
            until: "test until",
            per_page: 100,
            page: 1
        };

        const inputParamsCopy = {
            owner: "test owner", 
            repo: "test repo", 
            sha: "test sha",
            path: "test path",
            author: "test author",
            until: "test until",
            per_page: 100,
            page: 1
        };

        await octokit.listCommitCommentContributors(inputParams);

        expect(inputParams).toEqual(inputParamsCopy);
    });

    test("should be equal with commit contributions when there are no comments and 'since' is provided", async () => {
        sinon.stub(octokit, "listCommitContributors").resolves([
            { id: 201, contributions: 1 }
        ]);
        sinon.stub(octokit, "listCommentContributors").resolves([]);

        const input = { owner: "test", repo: "test", since: "test" };

        const output = [
            { id: 201, contributions: 1 }
        ];

        expect(await octokit.listCommitCommentContributors(input)).toEqual(output);
    });

    test("should be equal with commit contributions when there are no comments and 'since' is not provided", async () => {
        sinon.stub(octokit, "_listContributors").resolves([
            { id: 201, contributions: 1 }
        ]);
        sinon.stub(octokit, "listCommentContributors").resolves([]);

        const input = { owner: "test", repo: "test" };

        const output = [
            { id: 201, contributions: 1 }
        ];

        expect(await octokit.listCommitCommentContributors(input)).toEqual(output);
    });

    test("should be equal with comment contributions when there are no commits and since is provided", async () => {
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
        sinon.stub(octokit, "_listContributors").resolves([]);
        sinon.stub(octokit, "listCommentContributors").resolves([
            { id: 201, contributions: 1 }
        ]);

        const input = { owner: "test", repo: "test" };

        const output = [
            { id: 201, contributions: 1 }
        ];

        expect(await octokit.listCommitCommentContributors(input)).toEqual(output);
    });

    test("should aggregate and sort commit and comment contributions", async () => {
        sinon.stub(octokit, "_listContributors").resolves([
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

    test("should call listCommentContributors and listCommitContributors with correct params", async () => {
        const listCommitsStub = sinon.stub(octokit, "listCommitContributors");
        const listCommentsStub = sinon.stub(octokit, "listCommentContributors");
        listCommitsStub.resolves([]);
        listCommentsStub.resolves([]);
        const input = {
            owner: "test owner", 
            repo: "test repo", 
            since: "test since",
            sha: "test sha",
            path: "test path",
            author: "test author",
            until: "test until",
            per_page: 100,
            page: 5
        };

        const expected = {
            owner: "test owner", 
            repo: "test repo",
            since: "test since"
        };

        await octokit.listCommitCommentContributors(input);

        sinon.assert.calledWith(listCommitsStub, expected);
        sinon.assert.calledWith(listCommentsStub, expected);
    });
    
    test("should call listCommentContributors and _listContributors with correct params", async () => {
        const _listContributorsStub = sinon.stub(octokit, "_listContributors");
        const listCommentsStub = sinon.stub(octokit, "listCommentContributors");
        _listContributorsStub.resolves([]);
        listCommentsStub.resolves([]);
        const input = {
            owner: "test owner", 
            repo: "test repo",
            sha: "test sha",
            path: "test path",
            author: "test author",
            until: "test until",
            per_page: 100,
            page: 5
        };

        const expected = {
            owner: "test owner", 
            repo: "test repo"
        };

         await octokit.listCommitCommentContributors(input);

         sinon.assert.calledWith(_listContributorsStub, expected);
         sinon.assert.calledWith(listCommentsStub, expected);
    });
});

describe("listCommentContributorsForOrg()", () => {
    // listCommentContributorsForOrg(params) is just a wrapper for _listForOrgHelper(this.listCommentContributors, params).
    // Refer to _listForOrgHelper tests for more thorough testing.

    afterEach(() => {
        sinon.restore();
    });

    test("should call _listForOrgHelper with the correct arguments", async () => {
        const correctFunction = octokit.listCommentContributors;
        const params = {
            org: "test org",
            type: "test type"
        };
        const _listForOrgSpy = sinon.stub(octokit, "_listForOrgHelper");

        await octokit.listCommentContributorsForOrg(params);
        sinon.assert.calledWith(_listForOrgSpy, correctFunction, params);
    });
});

describe("listCommitContributorsForOrg()", () => {
    // listCommitContributorsForOrg(params) is just a wrapper for _listForOrgHelper(this.listCommitContributors, params).
    // Refer to _listForOrgHelper tests for more thorough testing.

    afterEach(() => {
        sinon.restore();
    });

    test("should call _listForOrgHelper with the correct arguments", async () => {
        const correctFunction = octokit.listCommitContributors;
        const params = {
            org: "test org",
            type: "test type"
        };
        const _listForOrgSpy = sinon.stub(octokit, "_listForOrgHelper");

        await octokit.listCommitContributorsForOrg(params);
        sinon.assert.calledWith(_listForOrgSpy, correctFunction, params);
    });
});

describe("listContributorsForOrg()", () => {
    // listContributorsForOrg(params) is just a wrapper for _listForOrgHelper(this._listContributors, parameters).
    // Refer to _listForOrgHelper tests for more thorough testing.

    afterEach(() => {
        sinon.restore();
    });

    test("should call _listForOrgHelper with the correct arguments", async () => {
        const correctFunction = octokit._listContributors;
        const params = {
            org: "test org",
            type: "test type"
        };
        const _listForOrgSpy = sinon.stub(octokit, "_listForOrgHelper");

        await octokit.listContributorsForOrg(params);
        sinon.assert.calledWith(_listForOrgSpy, correctFunction, params);
    });
});

describe("listCommitCommentContributorsForOrg()", () => {
    // listCommitCommentContributorsForOrg(params) is just a wrapper for _listForOrgHelper(listCommitCommentContributors, params).
    // Refer to _listForOrgHelper tests for more thorough testing.

    afterEach(() => {
        sinon.restore();
    });

    test("should call _listForOrgHelper with the correct arguments", async () => {
        const correctFunction = octokit.listCommitCommentContributors;
        const params = {
            org: "test org",
            type: "test type"
        };
        const _listForOrgSpy = sinon.stub(octokit, "_listForOrgHelper");

        await octokit.listCommitCommentContributorsForOrg(params);
        sinon.assert.calledWith(_listForOrgSpy, correctFunction, params);
    });
});