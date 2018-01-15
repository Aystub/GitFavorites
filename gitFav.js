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
  if(favorites.gitFavObjs != undefined && favorites.gitFavObjs.length > 0){
    var favDiv = '<div id="gitFavoritesDiv" class="boxed-group flush" role="navigation">\
                    <h3>Favorited repositories</h3>\
                    <ul id="gitFavsList" class="boxed-group-inner mini-repo-list">';

    // Populate the favorited repos
    for(var i = 0; i < favorites.gitFavObjs.length; i++){
        // The object
        favorite = favorites.gitFavObjs[i];

        // Get the info we need
        var owner = favorite.project_name.split('/')[0];
        var project = favorite.project_name.split('/')[1];
        var type = favorite.project_type == "private" ? "octicon-lock" : "octicon-repo"
        var repoSVG = '<path d="M4,9 L3,9 L3,8 L4,8 L4,9 L4,9 Z M4,6 L3,6 L3,7 L4,7 L4,6 L4,6 Z M4,4 L3,4 L3,5 L4,5 L4,4 L4,4 Z M4,2 L3,2 L3,3 L4,3 L4,2 L4,2 Z M12,1 L12,13 C12,13.55 11.55,14 11,14 L6,14 L6,16 L4.5,14.5 L3,16 L3,14 L1,14 C0.45,14 0,13.55 0,13 L0,1 C0,0.45 0.45,0 1,0 L11,0 C11.55,0 12,0.45 12,1 L12,1 Z M11,11 L1,11 L1,13 L3,13 L3,12 L6,12 L6,13 L11,13 L11,11 L11,11 Z M11,1 L2,1 L2,10 L11,10 L11,1 L11,1 Z" id="Shape"></path>';
        var lockSVG = '<path d="M4,13 L3,13 L3,12 L4,12 L4,13 L4,13 Z M12,7 L12,14 C12,14.55 11.55,15 11,15 L1,15 C0.45,15 0,14.55 0,14 L0,7 C0,6.45 0.45,6 1,6 L2,6 L2,4 C2,1.8 3.8,0 6,0 C8.2,0 10,1.8 10,4 L10,6 L11,6 C11.55,6 12,6.45 12,7 L12,7 Z M3.8,6 L8.21,6 L8.21,4 C8.21,2.78 7.23,1.8 6.01,1.8 C4.79,1.8 3.81,2.78 3.81,4 L3.81,6 L3.8,6 Z M11,7 L2,7 L2,14 L11,14 L11,7 L11,7 Z M4,8 L3,8 L3,9 L4,9 L4,8 L4,8 Z M4,10 L3,10 L3,11 L4,11 L4,10 L4,10 Z" id="Shape"></path>';
        var xSVG = '<polygon id="Shape" points="7.48 8 11.23 11.75 9.75 13.23 6 9.48 2.25 13.23 0.77 11.75 4.52 8 0.77 4.25 2.25 2.77 6 6.52 9.75 2.77 11.23 4.25"></polygon>';
        var svgPath = favorite.project_type == "private" ? lockSVG : repoSVG;

        // Append the info to our <div>
        favDiv += '<li id="'+ favorite.project_name +'-fav" class="'+ favorite.project_type +' source gitFavs">\
                    <span class="mini-repo-list-item css-truncate">\
                        <svg class="repo-icon octicon '+ type +'" height="16" width="12" viewBox="0 0 12 16" version="1.1">'+ svgPath +'</svg>\
                        <span class="repo-and-owner css-truncate-target">\
                          <a href="' + owner + '">' + owner.trim() +'</a>/<a href="' + favorite.project_url + '"><span class="repo">'+ project +'</span></a>\
                        </span>\
                      <span class="stars">\
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
