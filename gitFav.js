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
  //console.log("Favorites" + JSON.stringify(favorites));

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

        // Append the info to our <div>
        favDiv += '<li id="'+ favorite.project_name +'-fav" class="'+ favorite.project_type +' source gitFavs">\
                    <span class="mini-repo-list-item css-truncate">\
                      <a href="'+ favorite.project_url + '">\
                        <span class="repo-icon octicon '+ type +'"></span>\
                        <span class="repo-and-owner css-truncate-target">\
                          <span class="owner css-truncate-target" title="'+ owner +'">'+ owner +'</span>/<span class="repo" title="'+ project +'">'+ project +'</span>\
                        </span>\
                      </a>\
                      <span class="stars">\
                        <span id="'+ favorite.project_name +'-unfav" class="octicon octicon-x" style="cursor:pointer;"></span>\
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
