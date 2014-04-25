// Search the article for #bodyContent and find all links pointing to other wikipedia articles
var bodyContent = $("#bodyContent");
var a = $("a[href^='/wiki']", bodyContent);
var footnoteTally = 1;

function createCard(origLink,index) {
	origLink.attr("class","wikiLink");
	origLink.after("<sup class='mainText'> " + footnoteTally + "</sup> ");
	var origText = origLink.text();
	var origHref = origLink.attr("href");
	var editedHref = origHref.substring(6);
	editedHref = editedHref.replace("(","");
	editedHref = editedHref.replace(")","");

	// Put infoCard placeholder at the end of paragraphs containing a wikiLink, one placeholder for each link
	var containingParent = origLink.parent();

	if ($("#infoCard" + editedHref).length == 0) {
		var card = "<span class='infoCard' id='infoCard" + editedHref + "'><span class='infoCardBody' id='infoCardBody" + editedHref + "'><sup>" + footnoteTally + " </sup><a class='goLink' href='" + origHref + "'><b>" + origText + "</b></a>: </span></span>";

		containingParent.append(card);
		footnoteTally++;

		getAndDisplay(origHref, editedHref);
	};
};

function getAndDisplay(origHref, editedHref) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", origHref, true);
	xhr.onreadystatechange = function() {

		if (xhr.readyState == 4) {

			// Grab everything from new article
		    var entireArticle = xhr.responseText;
		    var tempArticle = entireArticle;

		    // If there's an anchor tag in the link, then find the anchored content
			if (origHref.indexOf("#") != "-1") {

				// Get the Id of the anchor tag
				var anchorPosLink = origHref.indexOf("#");
				var anchorId = origHref.substring(anchorPosLink+1);

				// Find the position of the anchor tag in the article
				var anchorPosArticle = entireArticle.indexOf('id="' + anchorId + '"');
				// Trim everything before
				tempArticle = entireArticle.substring(anchorPosArticle);
			} 

		    // Find the start position (the first <p>) of the paragraph we want
		    var nFirst=tempArticle.indexOf("<p>");
		    // Remove everything before start position, save it in new string
		    tempArticle = tempArticle.substring(nFirst+3);
		    // Find the end position (the first </p>) of the paragraph
			var nLast=tempArticle.indexOf("</p>");
			// Remove everything after the end position, save it in a final string			
			var cardContent = tempArticle.substring(0,nLast);

		    //  Update placeholder with the new article
		    $("#infoCardBody" + editedHref).append(cardContent);


  		};
	};
	xhr.send();

	// The regular expression produced a match, so notify the background page.
	chrome.extension.sendRequest({}, function(response) {});
};

a.each(function (index) {
	var origLink = $(this);

	// Only generate infoCards for links that we think are in the main body of the article
	//// Main body is currently defined as being exactly two levels below--child of a child--an object with id "mw-content-text"
	//// Don't use links that include a ":"
	//// Don't use links from "disambiguation" sections

	if (origLink.attr("href").indexOf(":") == "-1") {
		if (origLink.parent().attr("class") != "dablink") {
			if (origLink.parent().parent().attr("id")) {
				if (origLink.parent().parent().attr("id") == "mw-content-text") {
					createCard(origLink,index);
				};
			};
		};
	};
});