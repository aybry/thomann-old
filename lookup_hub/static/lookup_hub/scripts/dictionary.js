var dictionary;


class Dictionary {
    constructor() {
        // this.categories = [];
        // this.idTree = {};
    }

    initialise() {
        for (var cat of dictionaryData) {
            var category = new Category(cat);
            this.appendCategory(category);
        }
    }

    appendCategory(category) {
        // this.categories.push(category);
        var tbody = category.makeTbodyJQ();
        $("#hub-table").append(tbody);
    }


    // insertDataByID(id, entry) {
    //     var index = this.ids.indexOf(id);
    //     this.insertDataByIndex(index, entry);

    //     this.displayRowByID(id, entry);
    // }

    // insertDataByIndex(index, entry) {
    //     this.entries.splice(index, 0, entry);
    //     this.ids.splice(index, 0, entry.id);
    // }

    // displayRowByID(id, entry) {
    //     $(entry.html).insertBefore($("[data-row-id='" + id + "']")[0]);
    // }

    // displayRowByIndex(entry, index) {
    //     var id = this.ids[index];
    //     this.displayRowByID(entry, id);
    // }

    // remove(entryID) {
    //     var index = this.ids.indexOf(entryID);

    //     this.ids.splice(index, 1);
    //     this.entries.splice(index, 1);

    //     $("[data-row-id='" + entryID + "']").remove();
    // }

    undo() {
        if (
            lastDeleteNeighbourIDs().length > 0 &&
            lastDeleted().length > 0 &&
            lastDeleteNeighbourIDs().length == lastDeleted().length
        ) {
            sockAddRowID(popFromSession("lastDeleteNeighbourIDs"), popFromSession("lastDeleted"));
        }

        if (
            lastDeleteNeighbourIDs().length == 0 &
            lastDeleted().length == 0
        ) {
            $("#undo-button").prop("disabled", true);
        }
    }

    // replace(entry) {
    //     var index = this.ids.indexOf(entry.id);
    //     this.entries[index] = entry;

    //     $(".hub-entry[data-row-id='" + entry.id + "']").remove();
    //     $(dictionaryElemsHTML(entry)).insertAfter($("tr[data-row-id='" + entry.id + "']").children()[1]);
    // }
}


class Category {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;

        if (typeof(data["row_set"]) !== "undefined") {
            // When category barebones is fetched (see serialisers)
            this.rows = this.createRows(data["row_set"]);
        }
    }

    createRows(rows) {
        var catRows = new Array();
        for (var rowData of rows) {
            catRows.push(new Row(rowData));
        }
        return catRows;
    }

    makeTbodyJQ() {
        var container = $(this.containerHTML);
        for (var row of this.rows) {
            container.append(row.jq);
        }
        container.append(this.lastRowJQ);
        container.append($("<tr class='spacer-row'><td></td></tr>"));
        return container;
    }


    insertNewAfter(prevCatID) {
        var tbody = this.makeTbodyJQ();
        var prevTbody = getTbodyElementByCatID(prevCatID);
        tbody.insertAfter(prevTbody);
        print(prevCatID)
        print('inserted')
    }

    get lastRowJQ() {
        return $(`<tr data-cat-id="${this.id}">
            <td></td>
            <td class="buttons-left">
                <button
                    class="pure-button dictionary-button"
                    data-row-key="-1"
                    title="Insert new row here"
                    onclick="sockAppendRow('${this.id}');">
                    <i class="far fa-plus-square fa-lg"></i>
                </button>
            </td>
        </tr>
        <tr data-cat-id="${this.id}">
            <td></td>
            <td class="buttons-left">
                <button
                    class="pure-button dictionary-button"
                    data-row-key="-1"
                    title="Insert new category here"
                    onclick="sockInsertCat('${this.id}');">
                    <i class="fas fa-folder-plus fa-lg"></i>
                </button>
            </td>
        </tr>`)
    }

    get containerHTML() {
        return `
        <tbody class="cat-container" data-cat-id="${escapeHTML(this.id)}">
            <tr class="cat-header-row">
                <td class="filler"></td>
                <td class="filler"></td>
                <th colspan="3" class="cat-header">${escapeHTML(this.name)}</th>
                ${rightButtonsHTMLCategory(this)}
            </tr>
        </tbody>`
    }
}


class Row {
    constructor(data) {
        this.id = data.id;

        this.en = new Cell("en", data.cell_set.filter(cell => {return cell.language == "en"})[0]);
        this.de = new Cell("de", data.cell_set.filter(cell => {return cell.language == "de"})[0]);
        this.nl = new Cell("nl", data.cell_set.filter(cell => {return cell.language == "nl"})[0]);

        this.cells = [this.en, this.de, this.nl];

        this.pureJSON = data;
    }

    get jq() {
        return $(this.html);
    }

    get html() {
        return rowHTML(this);
    }

    getattr(attribute) {
        if (attribute === "en" ) { return this.en }
        else if (attribute === "de" ) { return this.de }
        else if (attribute === "nl" ) { return this.nl }
        else { return null }
    }

    commentHTML(language) {
        var comment = this.getattr(language).comment;
        if ([undefined, null, ""].indexOf(comment) == -1) {
            return `
                <span>
                    <i class="entry-comment fa fa-sticky-note fa-lg" title="${ escapeHTML(comment) }"></i>
                </span>
            `
        } else {
            return ``
        }
    }

    colourHTML(language) {
        var colour = this.getattr(language).colour;
        if ([undefined, null, ""].indexOf(colour) == -1) {
            if (colour.toLowerCase() != "#ffffff") {
                return `
                    style="border: 10px; border-color: ${ colour }; border-style: none solid none none;"
                `
            }
        } else {
            return ``
        }
    }
}


class Cell {
    constructor(language, data) {
        this.language = language;

        // print('Cell')
        // print(data)

        if (typeof(data) === "undefined") {
            this.initialise();
        } else {
            this.id = data.id;
            this.text = emptyIfNull(data.text);
            this.comment = emptyIfNull(data.comment);
            this.colour = emptyIfNull(data.colour);
        }
    }

    getattr(attribute) {
        if (attribute === "id") { return this.id; }
        else if (attribute === "text") { return this.text; }
        else if (attribute === "comment") { return this.comment; }
        else if (attribute === "colour") { return this.colour; }
        else { return null }
    }

    initialise() {
        this.id = "";
        this.text = "";
        this.comment = "";
        this.colour = "";
    }
}


function emptyIfNull(string) {
    if (string === null) {
        return "";
    } else {
        return String(string);
    }
}


var escape = document.createElement('textarea');
function escapeHTML(html) {
    escape.textContent = html;
    return escape.innerHTML;
}


const leftButtonsHTML = (row) => `
    <td class="buttons-left">
        <button
            class="pure-button dictionary-button"
            title="Delete this row"
            data-key="${ row.id }"
            onclick="sockDeleteRow('${ row.id }');">
            <i class="far fa-minus-square fa-lg"></i>
        </button>
    </td>
    <td class="buttons-left">
        <button
            class="pure-button dictionary-button"
            title="Insert new row here"
            data-key="${ row.id }"
            onclick="sockInsertRow('${ row.id }');">
            <i class="far fa-plus-square fa-lg"></i>
        </button>
    </td>
`


// data-row-id="${ row.id }">
const dictionaryElemsHTML = (row) => `
    <td class="hub-entry text-cell de"
        ` + row.colourHTML("de") + `>
        <div class="hub-entry-text"
            id="${ row.id }-de"
            data-key="${ row.id }"
            data-target-language="de">
            ${ escapeHTML(row.de.text) }
        </div>
        ` + row.commentHTML("de") + `
    </td>
    <td class="hub-entry text-cell en"
        ` + row.colourHTML("en") + `>
        <div class="hub-entry-text"
            id="${ row.id }-en"
            data-key="${ row.id }"
            data-target-language="en">
            ${ escapeHTML(row.en.text) }
        </div>
        ` + row.commentHTML("en") + `
    </td>
    <td class="hub-entry text-cell nl"
        ` + row.colourHTML("nl") + `>
        <div class="hub-entry-text"
            id="${ row.id }-nl"
            data-key="${ row.id }"
            data-target-language="nl">
            ${ escapeHTML(row.nl.text) }
        </div>
        ` + row.commentHTML("nl") + `
    </td>
    `


const rightButtonsHTML = (row) => `
    <td class="buttons-right"
        data-row-id="${ row.id }">
        <button
            class="pure-button dictionary-button"
            title="Edit this row"
            data-key="${ row.id }"
            onclick="sockGetRow('${ row.id }');">
            <i class="far fa-edit fa-lg"></i>
        </button>
    </td>
    `

const rightButtonsHTMLCategory = (category) => `
    <td class="buttons-right"
        data-row-id="${ category.id }">
        <button
            class="pure-button dictionary-button"
            title="Edit this category"
            data-key="${ category.id }"
            onclick="sockGetCaategory('${ category.id }');">
            <i class="fas fa-edit fa-lg"></i>
        </button>
    </td>
    `

const rowHTML = (row) => `<tr data-row-id="${ row.id }">` +
        leftButtonsHTML(row) +
        dictionaryElemsHTML(row) +
        rightButtonsHTML(row) +
    `</tr>`;


function initSession() {
    window.sessionStorage.lastDeleteNeighbourIDs = "[]";
    window.sessionStorage.lastDeleted = "[]";
}


function pushToSession(key, value) {
    var sessArray = JSON.parse(window.sessionStorage.getItem(key));
    sessArray.push(value);
    window.sessionStorage.setItem(key, JSON.stringify(sessArray));
}


function popFromSession(key) {
    var sessArray = JSON.parse(window.sessionStorage.getItem(key));
    var value = sessArray.pop();
    window.sessionStorage.setItem(key, JSON.stringify(sessArray));
    return value;
}


function lastDeleted() {
    return JSON.parse(window.sessionStorage.lastDeleted);
}


function lastDeleteNeighbourIDs() {
    return JSON.parse(window.sessionStorage.lastDeleteNeighbourIDs);
}


$(document).keydown(function(event) {
    // Close all inputs on escape key
    if (event.keyCode == 27) {
        $("#popup-container").hide();
    } else if (event.keyCode == 90 && event.ctrlKey && !$("#undo-button").prop("disabled")) {
        dictionary.undo();
    }
});


$(document).ready( function() {

    dictionary = new Dictionary();
    dictionary.initialise();

    initSession();
    $("#undo-button").prop("disabled", true);

    $("#popup-container").on("click", function(event) {
        if (event.target == $("#popup-container")[0]) {
            $("#popup-container").hide();
        }
    })

    $("#submit-row-button").on("click", function() {
        submitChanges();
        $("#popup-container").hide();
    })

    $(".edit-entry-row > input").on("keyup", function(event) {
        if (event.keyCode == 13) {
            $("#submit-row-button").click();
        }
    })

    $("#submit-category-button").on("click", function() {
        submitCategoryChanges();
        $("#popup-container").hide();
    })

    $("#category-name").on("keyup", function(event) {
        if (event.keyCode == 13) {
            $("#submit-category-button").click();
        }
    })

    $("#dl-dict-button").click( function(event) {
        event.preventDefault();
        window.location.href = "/download_dict";
    })

    if (
        lastDeleteNeighbourIDs().length > 0 &&
        lastDeleted().length > 0 &&
        lastDeleteNeighbourIDs().length == lastDeleted().length
    ) {
        $("#undo-button").prop("disabled", false);
    }
})