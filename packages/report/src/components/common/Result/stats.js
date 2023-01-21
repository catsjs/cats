/* eslint-disable no-nested-ternary */

// TODO: counts stats for all tests in subsuites, maybe we want a summary of subsuite?
const countSubSuites = (suites, prop) =>
    suites.reduce(
        (total, subsuite) =>
            subsuite[prop] && subsuite[prop].length > 0 ? total + 1 : total,
        0
    );

export const getStats2 = ({
    passes,
    failures,
    pending,
    skipped,
    beforeHooks,
    afterHooks,
    suites,
    tests,
}) =>
    getStats(
        passes,
        failures,
        pending,
        skipped,
        beforeHooks,
        afterHooks,
        suites,
        tests
    );

export const getStats = (
    passes,
    failures,
    pending,
    skipped,
    beforeHooks,
    afterHooks,
    suites,
    tests
) => {
    const hasPasses = passes && passes.length > 0;
    const hasFailures = failures && failures.length > 0;
    const hasPending = pending && pending.length > 0;
    const hasSkipped = skipped && skipped.length > 0;
    const hasBeforeHooks = beforeHooks && beforeHooks.length > 0;
    const hasAfterHooks = afterHooks && afterHooks.length > 0;
    const hasSuites = suites && suites.length > 0;
    const hasTests = tests && tests.length > 0;

    const hasFailed = hasFailures;
    const hasPassed = hasPasses && !hasFailed;
    const isPending = hasPending && !hasFailed && !hasPassed;
    const isSkipped = hasSkipped && !hasFailed && !hasPassed && !isPending;

    let totals = {
        totalPasses: hasPasses ? passes.length : 0,
        totalFailures: hasFailures ? failures.length : 0,
        totalPending: hasPending ? pending.length : 0,
        totalSkipped: hasSkipped ? skipped.length : 0,
    };

    if (!hasTests && hasSuites) {
        totals = suites.reduce((total, subsuite) => {
            const subStats = getStats2(subsuite);
            console.log(subStats, total);
            return {
                totalPasses: total.totalPasses + subStats.hasPassed ? 1 : 0,
                totalFailures: total.totalFailures + subStats.hasFailed ? 1 : 0,
                totalPending: total.totalPending + subStats.isPending ? 1 : 0,
                totalSkipped: total.totalSkipped + subStats.isSkipped ? 1 : 0,
            };
        }, totals);
    }

    return {
        hasPasses,
        hasFailures,
        hasPending,
        hasSkipped,
        hasBeforeHooks,
        hasAfterHooks,
        hasSuites,
        hasTests,
        hasFailed,
        hasPassed,
        isPending,
        isSkipped,
        ...totals,
    };
};
