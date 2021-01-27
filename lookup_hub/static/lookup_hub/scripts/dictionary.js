class Category {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.rows = this.createRows(data["row_set"]);
    }

    createRows(rows) {
        var catRows = new Array();
        for (var rowData of rows) {
            // for (var i = 0; i < 100; i++) {
                catRows.push(new Row(rowData));
            // }
        }
        return catRows;
    }

    makeTable() {
        var container = $(this.containerHTML);
        for (var row of this.rows) {
            container.append(row.jq);
        }
        container.append($("<tr class='spacer-row'><td></td></tr>"));
        $("#hub-table").append(container);
    }

    get containerHTML() {
        return `
        <tbody class="cat-container" data-cat-name="${escapeHTML(this.name)}">
            <tr>
                <td class="filler"></td>
                <td class="filler"></td>
                <th colspan="3" class="cat-header">${escapeHTML(this.name)}</th>
                ${rightButtonsHTML(self)}
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

        this.pureJSON = data;

        this.comments = {
            en: this.en.comment,
            de: this.de.comment,
            nl: this.nl.comment,
        }

        this.colours = {
            en: this.en.colour,
            de: this.de.colour,
            nl: this.nl.colour,
        }
    }

    get jq() {
        return $(this.html);
    }

    get html() {
        return rowHTML(this);
    }

    commentHTML(language) {
        var comment = this.comments[language];
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
        var colour = this.colours[language];
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

        if (typeof(data) === "undefined") {
            this.initialise();
        } else {
            this.id = data.id;
            this.text = emptyIfNull(data.text);
            this.comment = emptyIfNull(data.comment);
            this.colour = emptyIfNull(data.colour);
        }
    }

    initialise() {
        this.id = "";
        this.text = "";
        this.comment = "";
        this.colour = "";
    }
}


function createDictionaryTable() {
    for (var cat of dictionaryData) {
        for (var i = 0; i < 10; i++) {
            var category = new Category(cat);
            category.makeTable();
        }
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
            onclick="deleteRow('${ row.id }');">
            <i class="fa fa-minus-square fa-lg"></i>
        </button>
    </td>
    <td class="buttons-left">
        <button
            class="pure-button dictionary-button"
            title="Insert new row here"
            data-key="${ row.id }"
            onclick="insertNewRow('${ row.id }');">
            <i class="fa fa-plus-square fa-lg"></i>
        </button>
    </td>
`


const dictionaryElemsHTML = (row) => `
    <td class="hub-entry text-cell de"
        ` + row.colourHTML("de") + `
        data-row-id="${ row.id }">
        <div class="hub-entry-text"
            id="${ row.id }-de"
            data-key="${ row.id }"
            data-target-language="de">
            ${ escapeHTML(row.de.text) }
        </div>
        ` + row.commentHTML("de") + `
    </td>
    <td class="hub-entry text-cell en"
        ` + row.colourHTML("en") + `
        data-row-id="${ row.id }">
        <div class="hub-entry-text"
            id="${ row.id }-en"
            data-key="${ row.id }"
            data-target-language="en">
            ${ escapeHTML(row.en.text) }
        </div>
        ` + row.commentHTML("en") + `
    </td>
    <td class="hub-entry text-cell nl"
        ` + row.colourHTML("nl") + `
        data-row-id="${ row.id }">
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
            onclick="getRow('${ row.id }');">
            <i class="fa fa-pencil-square fa-lg"></i>
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

    createDictionaryTable()

    initSession();
    $("#undo-button").prop("disabled", true);

    $("#popup-container").on("click", function(event) {
        if (event.target == $("#popup-container")[0]) {
            $("#popup-container").hide();
        }
    })

    $("#submit-entry-button").on("click", function() {
        submitChanges();
        $("#popup-container").hide();
    })

    $(".edit-entry-row > input").on("keyup", function(event) {
        if (event.keyCode == 13) {
            $("#submit-entry-button").click();
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

    if (dummyPage) {
        $("#dl-dict-button").attr("title", "This only works in the actual hub.");
        $("#dl-dict-button").prop("disabled", true);
    }
})