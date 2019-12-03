const fs = require('fs');

/**
 * Get all files from a directory recursively
 * @param {String} dir Directory
 * @returns {Array} All files found recursively
 */

function get_recurscive_files_array (dir) {

    let files = [];
    let dirs_to_scan = [];

    function crawl_dir (path) {

        if (!path.endsWith('/')) path += '/';

        fs.readdirSync(path).forEach(
            x => {
                let new_path = `${path}${x}`;

                if (fs.statSync(new_path).isFile()) {
                    files.push(new_path);
                } else dirs_to_scan.push(new_path);
            }
        );
        
    }

    crawl_dir(dir);

    while (true) {
        try {
            crawl_dir(dirs_to_scan.pop());
        } catch (e) {
            return files;
        }
    }
}

/**
 * 
 * @param {Array} array Array of items to be sorted
 * 
 * @param  {Function} conditions Condition by which to return the item in array.
 * Should return true or false
 * e.g. function (item) { this.name = sizeBiggerThan5MB; if (item.size > 5MB) return true  }
 * 
 * @returns {Object}
 */
function sort_by_condition (array, ...conditions) {

    let out = {};

    conditions.forEach(
        condition => {
            out[condition.name] = [];

            array.forEach(
                item => {
                    if ( condition( item ) ) out[condition.name].push(item);
                }
            );
        }
    );

    return out;
}

/**
 * 
 * @param {String} ending Ending of the file to match
 * 
 * Just a addition for the sort_by_condition to make it more verbose
 */
function file_type (ending) {
    let f_func =  function (file) {
        if (file.endsWith(ending)) return true;
    };

    Object.defineProperty(f_func, 'name', { value: ending, writable: false });

    return f_func;
}

module.exports = {
    get_recurscive_files_array,
    sort_by_condition,
    file_type
};