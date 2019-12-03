const fs = require('fs');
const mwd = require('./functions');

const all_files = mwd.get_recurscive_files_array('./files');

const files = mwd.sort_by_condition(
    all_files,
    mwd.file_type('html'),
    mwd.file_type('css'),
    mwd.file_type('mwd')
);
// ===============================

function check_required_files (files) {

    let essential_file_count = 0;
    let essential_files = ['header.mwd', 'footer.mwd'];

    essential_files.forEach(
        essential_file => {
            files.forEach(
                file => {
                    if (file.includes(essential_file)) essential_file_count += 1;
                }
            );
        }
    );

    if (essential_files.length === essential_file_count) {
        return true;
    } else return false;
}

function dig (files_arr, file_to_find) {
    for (let i = 0; i < files_arr.length; i++) {
        if (files_arr[i].includes(file_to_find)) return files_arr[i];
    }
}

/**
 * 
 * @param {Array} htmlFiles Array of all html files to be rendered
 */
function html_render (htmlFiles, mwdFiles) {

    const FILES = htmlFiles.concat(mwdFiles);

    if ( ! check_required_files( FILES ) ) return new Error("Missing or duplicate required files");
    
    /**
     * Process header
     */
    // Read the header by digging it out from the `FILES`
    let header = fs.readFileSync( (dig ( FILES, 'header.mwd' )) ).toString();
    header_head_elements = '';
    header_body_elements = '';

    function tag_occurances (tag) {
        temp = header;
        counter = 0;
        loop_counter = 0;
        while (true) {
            if (counter !== loop_counter) return counter;
            loop_counter += 1;
            if (temp.includes(`<${tag}>`)) counter += 1;
            temp = temp.replace(`<${tag}>`, '');
        }
    }

    function get_tag (tag, include_tag) {
        if ( ! include_tag ) include_tag = false;
        let title_open_index = header.search(`<${tag}>`);
        let title_close_index = header.search(`</${tag}>`)+`</${tag}>`.length;
        let stolen_header = header.substring(title_open_index, title_close_index);    
        header = header.replace(stolen_header, '');
        return (include_tag) ? stolen_header.replace(`<${tag}>`, '').replace(`</${tag}>`, '') : stolen_header;
    }

    header_head_elements += get_tag('title');

    for (let i = -3; i < tag_occurances('style'); i += 1) {
        header_head_elements += get_tag('style');
    }

    header_body_elements += get_tag('body', true);

    header_html = `<!DOCTYPE html><html><head>${header_head_elements}^^^MWD^^^HEAD^^^MWD^^^</head><body>${header_body_elements}`;

    /**
     * Process footer
     */
    
    footer_html = `</body></html>`;

    /**
     * Process to file
     */
    function process_html (file) {
        let out = '';

        function get (from, tag, include_tag) {
            if ( ! include_tag ) include_tag = false;
            let title_open_index = from.search(`<${tag}>`);
            let title_close_index = from.search(`</${tag}>`)+`</${tag}>`.length;
            let stolen_from = from.substring(title_open_index, title_close_index);    
            from = from.replace(stolen_from, '');
            return (include_tag) ? stolen_from : stolen_from.replace(`<${tag}>`, '').replace(`</${tag}>`, '');
        }

        const _meta = get(fs.readFileSync(file).toString(), 'mwd');

        const meta = {
            url: get( _meta, 'url' ),
            title: get( _meta, 'title' ),
            head: get( _meta, 'head' )
        };

        let contents = fs.readFileSync(file).toString();

        contents = contents.replace( get( contents, 'mwd', true ), '' );

        out = header_html + contents + footer_html;

        if (meta.head) {
            out = out.replace('^^^MWD^^^HEAD^^^MWD^^^', meta.head);
        } else out = out.replace('^^^MWD^^^HEAD^^^MWD^^^', '');

        fs.writeFileSync(`./out/${file.replace('./files/', '')}`, out);
    }


    process_html(htmlFiles[2]);
}

// console.log(html_render(files.html, files.mwd));
html_render(files.html, files.mwd);