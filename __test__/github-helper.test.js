const GitHubHelper = require("../github-helper");
require("dotenv").config();
const githubHelper = new GitHubHelper(process.env.token);

describe("_sortByContributions()", () => {
    test("should sort user objects by contributions with no identical contributions", () => {
        const input = [
            {id: 151234, name: "user1", contributions: 54},
            {id: 9123, name: "user9", contributions: 17},
            {id: 7, name: "user7", contributions: 103},
            {id: 221341, name: "user2", contributions: 5},
            {id: 5123, name: "user5", contributions: 7},
            {id: 31234, name: "user3", contributions: 124}
        ];

        const output = [
            {id: 31234, name: "user3", contributions: 124},
            {id: 7, name: "user7", contributions: 103},
            {id: 151234, name: "user1", contributions: 54},
            {id: 9123, name: "user9", contributions: 17},
            {id: 5123, name: "user5", contributions: 7},
            {id: 221341, name: "user2", contributions: 5}
        ];

        expect(input.sort(githubHelper._sortByContributions)).toEqual(output);
    });

    test("should handle when some users have the same contributions", () => {
        const input = [
            {id: 151234, name: "user1", contributions: 54},
            {id: 9123, name: "user9", contributions: 54},
            {id: 7, name: "user7", contributions: 103},
            {id: 221341, name: "user2", contributions: 5},
            {id: 5123, name: "user5", contributions: 7},
            {id: 31234, name: "user3", contributions: 124}
        ];

        const output = [
            {id: 31234, name: "user3", contributions: 124},
            {id: 7, name: "user7", contributions: 103},
            {id: 151234, name: "user1", contributions: 54},
            {id: 9123, name: "user9", contributions: 54},
            {id: 5123, name: "user5", contributions: 7},
            {id: 221341, name: "user2", contributions: 5}
        ];

        expect(input.sort(githubHelper._sortByContributions)).toEqual(output);
    });

    test("should throw an error when contributions is not defined on an object", () => {
        const input = [
            {id: 151234, name: "user1", contributions: 54},
            {id: 9123, name: "user9", contributions: 54},
            {id: 7, name: "user7", contributions: 103},
            {id: 221341, name: "user2", contributions: 5},
            {id: 5123, name: "user5"},
            {id: 31234, name: "user3", contributions: 124}
        ];

        expect(() => input.sort(githubHelper._sortByContributions)).toThrow();
    });
});

describe("_contributorDictToArr()", () => {
    test("should convert dictionary of users with no identical contributions into sorted user array", () => {
        const input = {
            151234: {id: 151234, name: "user1", contributions: 54},
            221341: {id: 221341, name: "user2", contributions: 5},
            31234: {id: 31234, name: "user3", contributions: 124},
            5123: {id: 5123, name: "user5", contributions: 7},
            7: {id: 7, name: "user7", contributions: 103},
            9123: {id: 9123, name: "user9", contributions: 17},
        };

        const output = [
            {id: 31234, name: "user3", contributions: 124},
            {id: 7, name: "user7", contributions: 103},
            {id: 151234, name: "user1", contributions: 54},
            {id: 9123, name: "user9", contributions: 17},
            {id: 5123, name: "user5", contributions: 7},
            {id: 221341, name: "user2", contributions: 5},
        ];

        expect(githubHelper._contributorDictToArr(input)).toEqual(output);
    });

    test("should handle identical contributions", () => {
        const input = {
            151234: {id: 151234, name: "user1", contributions: 54},
            221341: {id: 221341, name: "user2", contributions: 5},
            31234: {id: 31234, name: "user3", contributions: 124},
            5123: {id: 5123, name: "user5", contributions: 54},
            7: {id: 7, name: "user7", contributions: 103},
            9123: {id: 9123, name: "user9", contributions: 17},
        };

        const output = [
            {id: 31234, name: "user3", contributions: 124},
            {id: 7, name: "user7", contributions: 103},
            {id: 5123, name: "user5", contributions: 54},
            {id: 151234, name: "user1", contributions: 54},
            {id: 9123, name: "user9", contributions: 17},
            {id: 221341, name: "user2", contributions: 5},
        ];

        expect(githubHelper._contributorDictToArr(input)).toEqual(output);
    });

    test("should should throw an error when contributions is not defined on an object", () => {
        const input = {
            151234: {id: 151234, name: "user1", contributions: 54},
            221341: {id: 221341, name: "user2", contributions: 5},
            31234: {id: 31234, name: "user3", contributions: 124},
            5123: {id: 5123, name: "user5"},
            7: {id: 7, name: "user7", contributions: 103},
            9123: {id: 9123, name: "user9", contributions: 17},
        };

        expect(() => githubHelper._contributorDictToArr(input)).toThrow();
    });

    test("should return an empty array for an empty dictionary", () => {
        const input = {};

        const output = [];

        expect(githubHelper._contributorDictToArr(input)).toEqual(output);
    });

    test("should work on a single user", () => {
        const input = {
            1: {id: 1, name: "user1", contributions: 124}
        };

        const output = [
            {id: 1, name: "user1", contributions: 124}
        ];

        expect(githubHelper._contributorDictToArr(input)).toEqual(output);
    });

    test("should throw an error on undefined input", () => {
        const input = undefined;

        expect(() => githubHelper._contributorDictToArr(input)).toThrow();
    });
});

describe("_aggregateContributions()", () => {
    test("should throw error on undefined input with an input identifier", () => {
        const input = undefined;
        const inputIdentifier = "user";

        expect(() => githubHelper._aggregateContributions(input, inputIdentifier)).toThrow();
    });

    test("should throw error on defined input with no input identifier", () => {
        const inputIdentifier = undefined;
        const input = [
            { "id": 96866113, "user": { "login": "jcrisell0", "id": 71697319 } },
            { "id": 95425175, "user": { "login": "kcarsberg4", "id": 79659988 } }, 
            { "id": 60268567, "user": { "login": "kcarsberg4", "id": 79659988 } }, 
            { "id": 69095888, "user": { "login": "kcarsberg4", "id": 79659988 } }, 
            { "id": 67983314, "user": { "login": "smeasham8", "id": 55049906 } }, 
            { "id": 33897768, "user": { "login": "jcrisell0", "id": 71697319 } }, 
            { "id": 70387397, "user": { "login": "smeasham8", "id": 55049906 } },
            { "id": 96866113, "user": { "login": "jcrisell0", "id": 71697319 } },
            { "id": 99371419, "user": { "login": "abestalli", "id": 46266764 } }, 
            { "id": 50762574, "user": { "login": "jcrisell0","id": 71697319 } }, 
            { "id": 35545295, "user": { "login": "jcrisell0", "id": 71697319 } }, 
            { "id": 71055174, "user": { "login": "abestalli", "id": 46266764 } }, 
            { "id": 66182670, "user": { "login": "bhainsworthe", "id": 68170276 } },
            { "id": 84481037, "user": { "login": "kcarsberg4", "id": 79659988 } }, 
            { "id": 88024408, "user": { "login": "jcrisell0", "id": 71697319 } }, 
            { "id": 83788440, "user": { "login": "abestalli", "id": 46266764 } }, 
            { "id": 90097321, "user": { "login": "kcarsberg4", "id": 79659988 } }
        ];

        expect(() => githubHelper._aggregateContributions(input)).toThrow();
    });

    test("should throw error if a contribution does not have identifier", () => {
        const inputIdentifier = "user";
        const input = [
            { "id": 96866113, "user": { "login": "jcrisell0", "id": 71697319 } },
            { "id": 95425175, "user": { "login": "kcarsberg4", "id": 79659988 } }, 
            { "id": 60268567, "user": { "login": "kcarsberg4", "id": 79659988 } }, 
            { "id": 69095888, "user": { "login": "kcarsberg4", "id": 79659988 } }, 
            { "id": 67983314, "user": { "login": "smeasham8", "id": 55049906 } }, 
            { "id": 33897768, "user": { "login": "jcrisell0", "id": 71697319 } }, 
            { "id": 70387397, "user": { "login": "smeasham8", "id": 55049906 } },
            { "id": 96866113, "author": { "login": "jcrisell0", "id": 71697319 } },
            { "id": 99371419, "user": { "login": "abestalli", "id": 46266764 } }, 
            { "id": 50762574, "user": { "login": "jcrisell0","id": 71697319 } }, 
            { "id": 35545295, "user": { "login": "jcrisell0", "id": 71697319 } }, 
            { "id": 71055174, "user": { "login": "abestalli", "id": 46266764 } }, 
            { "id": 66182670, "user": { "login": "bhainsworthe", "id": 68170276 } },
            { "id": 84481037, "user": { "login": "kcarsberg4", "id": 79659988 } }, 
            { "id": 88024408, "user": { "login": "jcrisell0", "id": 71697319 } }, 
            { "id": 83788440, "user": { "login": "abestalli", "id": 46266764 } }, 
            { "id": 90097321, "user": { "login": "kcarsberg4", "id": 79659988 } }
        ];

        expect(() => githubHelper._aggregateContributions(input, inputIdentifier)).toThrow();
    });

    test("should return an empty array when given an empty array", () => {
        const input = [];
        const inputIdentifier = "user";

        const output = [];

        expect(githubHelper._aggregateContributions(input, inputIdentifier)).toEqual(output);
    });

    test("should work with 1 contribution", () => {
        const input = [
            {id: 5123, user: {id: 15, login: "user15"}}
        ];
        const inputIdentifier = "user";

        const output = [
            {id: 15, login: "user15", contributions: 1}
        ];

        expect(githubHelper._aggregateContributions(input, inputIdentifier)).toEqual(output);
    });

    test("should aggregate user contributions (no dublicate contribution counts)", () => {
        const inputIdentifier = "user";
        const input = [
            { "id": 96866113, "user": { "login": "jcrisell0", "id": 71697319 } },
            { "id": 95425175, "user": { "login": "kcarsberg4", "id": 79659988 } }, 
            { "id": 60268567, "user": { "login": "kcarsberg4", "id": 79659988 } }, 
            { "id": 69095888, "user": { "login": "kcarsberg4", "id": 79659988 } }, 
            { "id": 67983314, "user": { "login": "smeasham8", "id": 55049906 } }, 
            { "id": 33897768, "user": { "login": "jcrisell0", "id": 71697319 } }, 
            { "id": 70387397, "user": { "login": "smeasham8", "id": 55049906 } },
            { "id": 96866113, "user": { "login": "jcrisell0", "id": 71697319 } },
            { "id": 99371419, "user": { "login": "abestalli", "id": 46266764 } }, 
            { "id": 50762574, "user": { "login": "jcrisell0","id": 71697319 } }, 
            { "id": 35545295, "user": { "login": "jcrisell0", "id": 71697319 } }, 
            { "id": 71055174, "user": { "login": "abestalli", "id": 46266764 } }, 
            { "id": 66182670, "user": { "login": "bhainsworthe", "id": 68170276 } },
            { "id": 84481037, "user": { "login": "kcarsberg4", "id": 79659988 } }, 
            { "id": 88024408, "user": { "login": "jcrisell0", "id": 71697319 } }, 
            { "id": 83788440, "user": { "login": "abestalli", "id": 46266764 } }, 
            { "id": 90097321, "user": { "login": "kcarsberg4", "id": 79659988 } }
        ];

        const output = [
            { "login": "jcrisell0", "id": 71697319, "contributions": 6 }, 
            { "login": "kcarsberg4", "id": 79659988, "contributions": 5 },
            { "login": "abestalli", "id": 46266764, "contributions": 3 },
            { "login": "smeasham8", "id": 55049906, "contributions": 2 },
            { "login": "bhainsworthe", "id": 68170276, "contributions": 1 }
        ];

        expect(githubHelper._aggregateContributions(input, inputIdentifier)).toEqual(output);
    });

    test("should handle dublicate contribution counts", () => {
        const inputIdentifier = "user";
        const input = [
            { "id": 95425175, "user": { "login": "kcarsberg4", "id": 79659988 } }, 
            { "id": 96866113, "user": { "login": "jcrisell0", "id": 71697319 } },
            { "id": 60268567, "user": { "login": "kcarsberg4", "id": 79659988 } }, 
            { "id": 69095888, "user": { "login": "kcarsberg4", "id": 79659988 } }, 
            { "id": 67983314, "user": { "login": "smeasham8", "id": 55049906 } }, 
            { "id": 33897768, "user": { "login": "jcrisell0", "id": 71697319 } }, 
            { "id": 70387397, "user": { "login": "smeasham8", "id": 55049906 } },
            { "id": 10327492, "user": { "login": "smeasham8", "id": 55049906 } },
            { "id": 96866113, "user": { "login": "jcrisell0", "id": 71697319 } },
            { "id": 99371419, "user": { "login": "abestalli", "id": 46266764 } }, 
            { "id": 50762574, "user": { "login": "jcrisell0","id": 71697319 } }, 
            { "id": 35545295, "user": { "login": "jcrisell0", "id": 71697319 } }, 
            { "id": 71055174, "user": { "login": "abestalli", "id": 46266764 } }, 
            { "id": 66182670, "user": { "login": "bhainsworthe", "id": 68170276 } },
            { "id": 84481037, "user": { "login": "kcarsberg4", "id": 79659988 } }, 
            { "id": 26471001, "user": { "login": "kcarsberg4", "id": 79659988 } },
            { "id": 88024408, "user": { "login": "jcrisell0", "id": 71697319 } }, 
            { "id": 83788440, "user": { "login": "abestalli", "id": 46266764 } }, 
            { "id": 90097321, "user": { "login": "kcarsberg4", "id": 79659988 } }
        ];

        const output = [
            { "login": "jcrisell0", "id": 71697319, "contributions": 6 }, 
            { "login": "kcarsberg4", "id": 79659988, "contributions": 6 },
            { "login": "abestalli", "id": 46266764, "contributions": 3 },
            { "login": "smeasham8", "id": 55049906, "contributions": 3 },
            { "login": "bhainsworthe", "id": 68170276, "contributions": 1 }
        ];

        expect(githubHelper._aggregateContributions(input, inputIdentifier)).toEqual(output);
    });

    test("should aggregate user contributions when an author/user has null value", () => {
        const inputIdentifier = "user";
        const input = [
            { "id": 96866113, "user": { "login": "jcrisell0", "id": 71697319 } },
            { "id": 95425175, "user": { "login": "kcarsberg4", "id": 79659988 } }, 
            { "id": 60268567, "user": null }, 
            { "id": 69095888, "user": { "login": "kcarsberg4", "id": 79659988 } }, 
            { "id": 67983314, "user": { "login": "smeasham8", "id": 55049906 } }, 
            { "id": 33897768, "user": { "login": "jcrisell0", "id": 71697319 } }, 
            { "id": 70387397, "user": { "login": "smeasham8", "id": 55049906 } },
            { "id": 96866113, "user": { "login": "jcrisell0", "id": 71697319 } },
            { "id": 99371419, "user": { "login": "abestalli", "id": 46266764 } }, 
            { "id": 50762574, "user": { "login": "jcrisell0","id": 71697319 } }, 
            { "id": 35545295, "user": { "login": "jcrisell0", "id": 71697319 } }, 
            { "id": 71055174, "user": { "login": "abestalli", "id": 46266764 } }, 
            { "id": 66182670, "user": { "login": "bhainsworthe", "id": 68170276 } },
            { "id": 84481037, "user": { "login": "kcarsberg4", "id": 79659988 } }, 
            { "id": 88024408, "user": { "login": "jcrisell0", "id": 71697319 } }, 
            { "id": 83788440, "user": { "login": "abestalli", "id": 46266764 } }, 
            { "id": 90097321, "user": { "login": "kcarsberg4", "id": 79659988 } }
        ];

        const output = [
            { "login": "jcrisell0", "id": 71697319, "contributions": 6 }, 
            { "login": "kcarsberg4", "id": 79659988, "contributions": 4 },
            { "login": "abestalli", "id": 46266764, "contributions": 3 },
            { "login": "smeasham8", "id": 55049906, "contributions": 2 },
            { "login": "bhainsworthe", "id": 68170276, "contributions": 1 }
        ];

        expect(githubHelper._aggregateContributions(input, inputIdentifier)).toEqual(output);
    });
});

describe("_aggregateContributors()", () => {
    test("should throw error if given undefined contributors list", () => {
        const input = undefined;

        expect(() => githubHelper._aggregateContributors(input)).toThrow();
    });

    test("should throw error if contributor object does not have contributions property", () => {
        const input = [
            { "login": "jcrisell0", "id": 71697319, contributions: 15 },
            { "login": "kcarsberg4", "id": 79659988, contributions: 100 }, 
            { "login": "btruckville4", "id": 79659988 },
            { "login": "smeasham8", "id": 55049906, contributions: 27 }
        ];

        expect(() => githubHelper._aggregateContributors(input)).toThrow();
    });

    test("should return an empty array when given an empty array", () => {
        const input = [];

        const output = [];

        expect(githubHelper._aggregateContributors(input)).toEqual(output);
    });

    test("should work with 1 contributor", () => {
        const input = [
            { "login": "jcrisell0", "id": 71697319, contributions: 15 }
        ];

        const output = [
            { "login": "jcrisell0", "id": 71697319, contributions: 15 }
        ];

        expect(githubHelper._aggregateContributors(input)).toEqual(output);
    });

    test("should work with list of contributors (no duplicates contribution counts)", () => {
        const input = [
            { "login": "wpockey0", "id": 54051, "contributions": 52 }, 
            { "login": "jnicholls1", "id": 97735, "contributions": 49 }, 
            { "login": "wpockey0", "id": 54051, "contributions": 24 },  
            { "login": "wtotterdell3", "id": 17677, "contributions": 89 }, 
            { "login": "mvamplus4", "id": 7198, "contributions": 96 }, 
            { "login": "blorentzen5", "id": 81085, "contributions": 18 }, 
            { "login": "cosheerin6", "id": 30237, "contributions": 60 }, 
            { "login": "cosheerin6", "id": 30237, "contributions": 12 },  
            { "login": "wpockey0", "id": 54051, "contributions": 17 }, 
            { "login": "wtotterdell3", "id": 17677, "contributions": 23 },
        ];

        const output = [
            { "login": "wtotterdell3", "id": 17677, "contributions": 112 }, 
            { "login": "mvamplus4", "id": 7198, "contributions": 96 },
            { "login": "wpockey0", "id": 54051, "contributions": 93 },
            { "login": "cosheerin6", "id": 30237, "contributions": 72 },
            { "login": "jnicholls1", "id": 97735, "contributions": 49 }, 
            { "login": "blorentzen5", "id": 81085, "contributions": 18 }, 
        ];

        expect(githubHelper._aggregateContributors(input)).toEqual(output);
    });

    test("should work with list of contributors (duplicate contribution counts)", () => {
        const input = [
            { "login": "wpockey0", "id": 54051, "contributions": 55 }, 
            { "login": "jnicholls1", "id": 97735, "contributions": 49 }, 
            { "login": "wpockey0", "id": 54051, "contributions": 24 },  
            { "login": "wtotterdell3", "id": 17677, "contributions": 89 }, 
            { "login": "mvamplus4", "id": 7198, "contributions": 96 }, 
            { "login": "blorentzen5", "id": 81085, "contributions": 49 }, 
            { "login": "cosheerin6", "id": 30237, "contributions": 60 }, 
            { "login": "cosheerin6", "id": 30237, "contributions": 12 },  
            { "login": "wpockey0", "id": 54051, "contributions": 17 }, 
            { "login": "wtotterdell3", "id": 17677, "contributions": 23 },
            { "login": "user1230", "id": 10495, "contributions": 2 },
            { "login": "user103956", "id": 60095, "contributions": 2 },
            { "login": "user11123", "id": 98723, "contributions": 1 },
            { "login": "user943", "id": 88392, "contributions": 1 },
            { "login": "user9", "id": 99334, "contributions": 1 },
            { "login": "user943", "id": 88392, "contributions": 1 },
            { "login": "user7", "id": 77777, "contributions": 1 },
        ];

        const output = [
            { "login": "wtotterdell3", "id": 17677, "contributions": 112 }, 
            { "login": "mvamplus4", "id": 7198, "contributions": 96 },
            { "login": "wpockey0", "id": 54051, "contributions": 96 },
            { "login": "cosheerin6", "id": 30237, "contributions": 72 },
            { "login": "blorentzen5", "id": 81085, "contributions": 49 },
            { "login": "jnicholls1", "id": 97735, "contributions": 49 },
            { "login": "user1230", "id": 10495, "contributions": 2 },
            { "login": "user103956", "id": 60095, "contributions": 2 },
            { "login": "user943", "id": 88392, "contributions": 2 },
            { "login": "user7", "id": 77777, "contributions": 1 },
            { "login": "user11123", "id": 98723, "contributions": 1 },
            { "login": "user9", "id": 99334, "contributions": 1 }, 
        ];

        expect(githubHelper._aggregateContributors(input)).toEqual(output);
    });
});