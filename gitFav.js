// This file is executed on github.com and adds the favorited objects to the sidebar

var port = chrome.runtime.connect();

// Function to be called from inside another dynamically generated function that
// removes a favorite from storage.
function deleteFav(favorites, parent, position){
  document.getElementById(parent).style.display = "none";
  // Splice out the favorite
  favorites.gitFavObjs.splice(position, 1);
    chrome.storage.sync.set(favorites, function() {
       // Re-bind onclicks due to array changes. Not very efficient but so fast who cares.
       attachClicks(favorites);
    });
}

// Function that loops through user's favorites and attaches a onclick function
// to each of the.
function attachClicks(favorites){
  if(favorites.gitFavObjs.length > 0){
    for(var j = 0; j < favorites.gitFavObjs.length; j++){
      // Id of the 'X' button on each favorite
      var unfavorite_action_id = favorites.gitFavObjs[j].project_name + '-unfav';

      // Id of the actual <li> element of the favorite
      var parent = favorites.gitFavObjs[j].project_name + '-fav';

      // Bind the dynamically generated onclick functions. This felt dirty writing...
      document.getElementById(unfavorite_action_id).onclick = (function(favorites, parent, position) {
        return function() {
          deleteFav(favorites, parent, position);
        };
      })(favorites, parent, j);
    }
  }else{
    // If user has no more favorites, hide the div.
    document.getElementById("gitFavoritesDiv").style.display = "none";
  }
}

// Get favorited projects from storage
chrome.storage.sync.get("gitFavObjs", function(favorites){
  // If we can get the array of favorite objects from storage and there are more than one,
  // populate a <div> with them.
  console.log(favorites);
  if(favorites.gitFavObjs != undefined && favorites.gitFavObjs.length > 0){
    var favDiv = '<div id="gitFavoritesDiv" class="boxed-group flush" role="navigation">\
                    <h3>Favorited repositories</h3>\
                    <ul id="gitFavsList" class="boxed-group-inner mini-repo-list" style="list-style-type: none; padding-top: 8px; padding-bottom: 8px;">';

    // Populate the favorited repos
    for(var i = 0; i < favorites.gitFavObjs.length; i++){
        // The object
        favorite = favorites.gitFavObjs[i];

        // Get the info we need
        var owner = favorite.project_name.split('/')[0];
        var project = favorite.project_name.split('/')[1];
        var iconType = favorite.project_type == "private" ? "octicon-lock" : "octicon-repo";
        var repoType = favorite.project_type == "private" ? "repo-private-icon" : "repo-icon";
        var repoSVG = '<path d="M4,9 L3,9 L3,8 L4,8 L4,9 L4,9 Z M4,6 L3,6 L3,7 L4,7 L4,6 L4,6 Z M4,4 L3,4 L3,5 L4,5 L4,4 L4,4 Z M4,2 L3,2 L3,3 L4,3 L4,2 L4,2 Z M12,1 L12,13 C12,13.55 11.55,14 11,14 L6,14 L6,16 L4.5,14.5 L3,16 L3,14 L1,14 C0.45,14 0,13.55 0,13 L0,1 C0,0.45 0.45,0 1,0 L11,0 C11.55,0 12,0.45 12,1 L12,1 Z M11,11 L1,11 L1,13 L3,13 L3,12 L6,12 L6,13 L11,13 L11,11 L11,11 Z M11,1 L2,1 L2,10 L11,10 L11,1 L11,1 Z" id="Shape"></path>';
        var lockSVG = '<path fill-rule="evenodd" d="M4 13H3v-1h1v1zm8-6v7c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h1V4c0-2.2 1.8-4 4-4s4 1.8 4 4v2h1c.55 0 1 .45 1 1zM3.8 6h4.41V4c0-1.22-.98-2.2-2.2-2.2-1.22 0-2.2.98-2.2 2.2v2H3.8zM11 7H2v7h9V7zM4 8H3v1h1V8zm0 2H3v1h1v-1z"></path>';
        var xSVG = '<polygon id="Shape" points="7.48 8 11.23 11.75 9.75 13.23 6 9.48 2.25 13.23 0.77 11.75 4.52 8 0.77 4.25 2.25 2.77 6 6.52 9.75 2.77 11.23 4.25"></polygon>';
        var svgPath = favorite.project_type == "private" ? lockSVG : repoSVG;

        // Append the info to our <div>
        favDiv += '<li id="'+ favorite.project_name +'-fav" class="'+ favorite.project_type +' source gitFavs">\
                    <span class="css-truncate" style="padding: 2px 15px; display: block;">\
                        <svg class="' + repoType + ' octicon '+ iconType +'" height="16" width="12" viewBox="0 0 12 16" version="1.1">'+ svgPath +'</svg>\
                        <span class="text-bold css-truncate-target" style="max-width: 230px; padding-left: 4px;">\
                          <a href="' + owner + '">' + owner.trim() +'</a>/<a href="' + favorite.project_url + '"><span class="repo">'+ project +'</span></a>\
                        </span>\
                      <span class="stars" style="float: right;">\
                        <svg id="'+ favorite.project_name +'-unfav" class="octicon octicon-x" height="16" width="12" viewBox="0 0 12 16" version="1.1" style="cursor:pointer; margin-top: 3px">'+ xSVG +'</svg>\
                      </span>\
                    </span>\
                  </li>';
    }

    // Close the favorites <ul> and <div>
    favDiv += '</ul></div>';

    // Add our favorites div to the DOM
    var div = document.getElementsByClassName("dashboard-sidebar")[0];
    div.innerHTML = favDiv + div.innerHTML;

    // Attach a click event to each 'X' on the favorites list items
    attachClicks(favorites);
  }
});
