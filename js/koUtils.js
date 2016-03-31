//http://stackoverflow.com/questions/20473070/jquery-knockout-render-template-in-memory
ko.renderTemplateX = function (name, data) {
    // create temporary container for rendered html
    var temp = $("<div>");

    // apply "template" binding to div with specified data
    ko.applyBindingsToNode(temp[0], { template: { name: name, data: data || {} } });

    // save inner html of temporary div
    var html = temp.html();

    // cleanup temporary node and return the result
    temp.remove();

    return html;
};
