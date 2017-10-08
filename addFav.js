// Shows up on the repository page and adds the favorite button

var key = "gitFavObjs";
var label = "";
var favoriteTxt = "<span class='octicon octicon-heart'></span> Favorite";
var unfavoriteTxt = "<span class='octicon octicon-heart'></span> Unfavorite";

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
            <span class="octicon octicon-heart"></span> '+ label +'\
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
              console.log("lable: " + label);
              if(label == "Unfavorite"){
                console.log("Favorite Removed");
                favorites.gitFavObjs.splice(position, 1);
                document.getElementById("git-add-fav").innerHTML = favoriteTxt;
                label = "Favorite";
              }else{ // Else, add it
                console.log("Favorite staged to be saved");
                favorites.gitFavObjs.push({'project_name': document.title, 'project_type': type, 'project_url': window.location.href}); //"https://github.com/"+document.getElementsByTagName('meta')['twitter:title'].getAttribute('content')
                document.getElementById("git-add-fav").innerHTML = unfavoriteTxt;
                label = "Unfavorite";
              }
            }else{ // If this is the first one we've saved, set it up as an array of objects
              console.log("1st Favorite staged to be saved");
              favorites.gitFavObjs = [{'project_name': document.title, 'project_type': type, 'project_url': window.location.href}];
              document.getElementById("git-add-fav").innerHTML = unfavoriteTxt;
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
