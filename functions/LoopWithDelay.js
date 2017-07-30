export default function loopWithDelay(callback, delay, begin, end) {
    function theLoop(callback, delay, current, end) {
        setTimeout(function () {
            callback(delay, current, end)
            if (++current <= end) {
                theLoop(callback, delay, current, end)
            }
        }, delay)
    }

    theLoop(callback, delay, begin, end)
}
