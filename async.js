/* eslint-disable */
'use strict';

exports.isStar = false;
exports.runParallel = runParallel;

function timed(timeout) {
    return job => job;
}


/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 */
function runParallel(jobs, parallelNum, timeout = 1000) {
    let timedJobs = jobs.map(timed(timeout)).map((x, i) => [x, i]);
    let result = [];
    let finished = 0;

    function onAnyResult(resolve, jobResult, jobIndex) {
        result[jobIndex] = jobResult;
        if (jobs.length == ++finished)
            resolve(result);
        else if (timedJobs.length)
            processJob(resolve, ...timedJobs.shift());
    }

    function processJob(resolve, job, jobIndex) {
        let handler = jobResult => onAnyResult(resolve, jobResult, jobIndex);
        job().then(handler).catch(handler);
    }

    return new Promise(resolve => {
        if (parallelNum > 0 && jobs.length) {
            let queue = timedJobs.slice(0, parallelNum);
            timedJobs = timedJobs.slice(parallelNum);
            queue.forEach(([x, i]) => processJob(resolve, x, i));
        }
        else resolve(result);
    });
}
