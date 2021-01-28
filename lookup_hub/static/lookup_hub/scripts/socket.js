var socket;
var currentEntry;




function startSocket() {
    var wsURL = "ws://"
        + window.location.hostname
        + ":8000"
        + "/ws/hub/";

    socket = new WebSocket(wsURL);

    socket.onopen = function() {
        print('yay')
        $("#socket-status").parent().children("span").text("Connected");
        $("#socket-status")
            .removeClass("disconnected")
            .addClass("connected");
    }

    socket.onclose = function() {
        socket = null
        $("#socket-status").parent().children("span").text("Disconnected");
        $("#socket-status")
            .removeClass("connected")
            .addClass("disconnected");
        console.error('Socket closed unexpectedly. Retrying...');

        print('Trying to connect...')
        setTimeout(startSocket, 1000);
    }

    socket.onmessage = function(event) {
        var data = JSON.parse(event.data);
        print(data)

        if (data["action"] == "remove_row") {
            removeRow(data["row_id"]);
        } else if (data["action"] == "insert_row") {
            insertRow(data["row_data"], data["neighbours"]);
        } else if (data["action"] == "fetched_row_data") {
            var row = new Row(data["row_data"]);
            showEditRowWindow(row);
        } else if (data["action"] == "insert_cat") {
            var cat = new Category(data["cat_data"]);
            cat.insertNewAfter(data["prev_cat_id"]);
        } else if (data["action"] == "fetched_cat_data") {
            var cat = new Category(data["cat_data"]);
            showEditCatWindow(cat);
        } else if (data["action"] == "updated_category") {
            updateCategory(data["cat_data"]);
        } else if (data["action"] == "updated_row") {
            var row = new Row(data["row_data"]);
            removeRow(row.id);
            insertRow(data["row_data"], data["neighbours"]);
        }
    };
}


function sockInsertRow(rowID) {
    socket.send(JSON.stringify({
        'method':'insert_new_row',
        'args': [rowID],
    }))
}


function sockDeleteRow(rowID) {
    socket.send(JSON.stringify({
        'method':'delete_row',
        'args': [rowID],
    }))
    // function sockRemoveRow(elemID) {
    //     var index = dictionary.ids.indexOf(elemID)
    //     pushToSession("lastDeleted", dictionary.entries[index].pureJSON);
    //     pushToSession("lastDeleteNeighbourIDs", dictionary.ids[index + 1]);

    //     dictionary.remove(elemID);

    //     var data = {
    //         entry_id: elemID,
    //     }

    //     $("#undo-button").prop("disabled", false);

    //     socket.emit("remove_row", data);
    // }
}


function sockAppendRow(catID) {
    socket.send(JSON.stringify({
        'method':'append_row',
        'args': [catID],
    }))
}


function sockInsertCat(catID) {
    socket.send(JSON.stringify({
        'method':'insert_new_cat',
        'args': [catID],
    }))
}


function sockGetRow(rowID) {
    var data = {
        method: 'fetch_row_data',
        args: [rowID],
    };

    socket.send(JSON.stringify(data));
}


function sockGetCaategory(catID) {
    var data = {
        method: 'fetch_cat_data',
        args: [catID],
    };

    socket.send(JSON.stringify(data));
}


function sockUpdateRow(rowData, rowID) {
    socket.send(JSON.stringify({
        method: "update_row",
        args: [
            rowID,
            rowData,
        ]
    }));
}


function sockUpdateCat(catData) {
    socket.send(JSON.stringify({
        method: "update_category",
        args: [
            catData,
        ]
    }));
}


function submitCategoryChanges() {
    catData = {
        id: $("#cat-id").text(),
        name: $("#category-name").val(),
    }

    sockUpdateCat(catData);
}


function submitChanges() {
    rowID = $("#row-id").text();

    rowData = {}
    for (lang of ['en', 'de', 'nl']) {
        rowData[lang] = {
            id: $(`#text-${lang}`).attr("data-cell-id"),
            text: $(`#text-${lang}`).val(),
            comment: nullIfEmpty($(`#comment-${lang}`).val()),
            colour: $(`#colour-${lang}`).val(),
            language: lang,
        }
    }

    sockUpdateRow(rowData, rowID);
}


function insertRow(rowData, neighbourRowIDs) {
    var newRow = new Row(rowData);
    if (neighbourRowIDs[0] !== null) {
        var rowBefore = getRowElementByID(neighbourRowIDs[0]);
        newRow.jq.insertAfter(rowBefore);
    } else if (neighbourRowIDs[1] !== null) {
        var rowAfter = getRowElementByID(neighbourRowIDs[1]);
        newRow.jq.insertBefore(rowAfter);
    } else {
        var headerRow = $(`.cat-container[data-cat-id='${rowData.category.id}'] > .cat-header-row`);
        newRow.jq.insertAfter(headerRow);
    }
}


function removeRow(rowID) {
    getRowElementByID(rowID).remove();
}


function getRowElementByID(rowID) {
    return $(`tr[data-row-id='${rowID}']`);
}


function getTheaderElementByCatID(catID) {
    var query = `tbody[data-cat-id="${catID}"] > tr > th.cat-header`
    return $(query);
}


function getTbodyElementByCatID(catID) {
    var query = `tbody[data-cat-id="${catID}"]`
    return $(query);
}


function updateCategory(catData) {
    var catTbody = $(getTheaderElementByCatID(catData.id));
    catTbody.text(catData.name);
}


function showEditCatWindow(category) {
    $("#cat-id").text(category.id);
    $("#category-name").val(category.name);
    showPopup('edit-category-form');
}


function showEditRowWindow(row) {
    $("#row-id").text(row.id);
    for (var cell of row.cells) {
        $(`#text-${cell.language}`).attr("data-cell-id", cell.id);
        for (item of ["text", "comment", "colour"]) {
            if (item == "colour" && cell.colour === null) {
                $("#" + item + "-" + cell.language).val("");
            } else {
                $("#" + item + "-" + cell.language).val(cell.getattr(item));
            }
        }
    }
    showPopup('edit-row-cells-form');
}


function nullIfEmpty(string) {
    if (string == "") {
        return null;
    } else {
        return String(string);
    }
}


startSocket();
