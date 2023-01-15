import matchPattern from 'lodash-match-pattern';

export default (opts, chai) => ({
    matchesExact: function (pattern) {
        const obj = this._obj;
        const matches = matchPattern(obj, pattern);

        this.assert(
            !matches,
            matches,
            'expected #{this} to not match the given pattern',
            JSON.stringify(pattern, null, 2), // stringify objects to prevent reordering in mocha
            JSON.stringify(obj, null, 2), // stringify objects to prevent reordering in mocha
            true
        );
    },
    matches: function (pattern) {
        const obj = this._obj;
        const matches = matchPattern(obj, { ...pattern, '...': '' });
        const expected = {};

        //TODO: nested keys?
        Object.keys(obj).forEach((key) => {
            if (
                !pattern[key] ||
                (matches && matches.indexOf('{' + key) === -1)
            ) {
                expected[key] = obj[key];
            } else {
                expected[key] =
                    typeof pattern[key] === 'function'
                        ? pattern[key].name
                        : pattern[key];
            }
        });

        this.assert(
            !matches,
            matches,
            'expected #{this} to not match the given pattern',
            JSON.stringify(expected, null, 2), // stringify objects to prevent reordering in mocha
            JSON.stringify(obj, null, 2), // stringify objects to prevent reordering in mocha
            true
        );
    },
});
