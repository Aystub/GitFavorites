// Shows up on the repository page and adds the favorite button

var key = "gitFavObjs";
var label = "";
var favoriteTxt = "Favorite";
var unfavoriteTxt = "Unfavorite";

var port = chrome.runtime.connect();

chrome.storage.sync.get(key, function(favorites){
    // Check our favorites to make sure we haven't already saved the current repo
    if(favorites.gitFavObjs != undefined && favorites.gitFavObjs.length > 0){
      var position = 0;
      for(position; position < favorites.gitFavObjs.length; position++){
        if(favorites.gitFavObjs[position].project_name == document.title){
          label = "Unfavorite";
          break;
        }
        else{
          label = "Favorite";
        }
      }
    }else{
      label = "Favorite";
    }

    // Grab the div containing the action buttons at the top
    var div = document.getElementsByClassName("pagehead-actions")[0];

    // Check if this is a public repo or not
    var type = "public";
    if(document.getElementsByClassName("public").length == 0){
      type = "private";
    }

    // Add and style our button
    var favButton = '<li>\
        <button id="git-add-fav" class="btn btn-sm js-toggler-target" aria-label="'+ label +' this repository" title="'+ label + ' ' + window.location.href + '" text:'+ label +'">\
            <svg class="octicon octicon-heart" height="16" width="16" viewBox="0 0 16 16" version="1.1">\
        		<path d="M11.2,3 C10.68,2.37 9.95,2.05 9,2 C8.03,2 7.31,2.42 6.8,3 C6.29,3.58 6.02,3.92 6,4 C5.98,3.92 5.72,3.58 5.2,3 C4.68,2.42 4.03,2 3,2 C2.05,2.05 1.31,2.38 0.8,3 C0.28,3.61 0.02,4.28 0,5 C0,5.52 0.09,6.52 0.67,7.67 C1.25,8.82 3.01,10.61 6,13 C8.98,10.61 10.77,8.83 11.34,7.67 C11.91,6.51 12,5.5 12,5 C11.98,4.28 11.72,3.61 11.2,2.98 L11.2,3 Z" id="Shape"></path>\
            </svg><span id="fav-label">'+ label +' </span>\
        </button>\
      </li>';

    // Append our button to the div full of buttons
    div.innerHTML = div.innerHTML + favButton;

    // Bind a click event to our button
    document.getElementById("git-add-fav").addEventListener("click",
      function() {
        chrome.storage.sync.get(key, function(favorites){
            if(favorites.gitFavObjs != undefined){
              // If we have already favorited this repo, remove it
              if(label == "Unfavorite"){
                console.log("Favorite Removed");
                favorites.gitFavObjs.splice(position, 1);
                document.getElementById("fav-label").innerHTML = favoriteTxt;
                label = "Favorite";
              }else{ // Else, add it
                console.log("Favorite staged to be saved");
                favorites.gitFavObjs.push({'project_name': document.title.split(":")[0], 'project_type': type, 'project_url': window.location.href}); //"https://github.com/"+document.getElementsByTagName('meta')['twitter:title'].getAttribute('content')
                document.getElementById("fav-label").innerHTML = unfavoriteTxt;
                label = "Unfavorite";
              }
            }else{ // If this is the first one we've saved, set it up as an array of objects
              favorites.gitFavObjs = [{'project_name': document.title, 'project_type': type, 'project_url': window.location.href}];
              document.getElementById("fav-label").innerHTML = unfavoriteTxt;
              label = "Unfavorite";
            }

            // Save and sync
            chrome.storage.sync.set(favorites, function() {
                  console.log('Favorites saved: ' + JSON.stringify(favorites));
            });
        });
      }
    );

});
