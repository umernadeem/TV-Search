"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");

const MISSING_IMAGE_URL = "http://tinyurl.com/missing-tv";


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(query) {
  let response = await axios.get(`http://api.tvmaze.com/search/shows?q=${query}`)

  let shows = response.data.map(result => {
    let show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : MISSING_IMAGE_URL,
    };
  });
  console.log(shows);
  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="Bletchly Circle San Francisco" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="get-episodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
//
//async function searchForShowAndDisplay() {
//  const term = $("#searchForm-term").val();
//  const shows = await getShowsByTerm(term);
//
//  $episodesArea.hide();
//  populateShows(shows);
//}
//
//$searchForm.on("submit", async function (evt) {
//  evt.preventDefault();
//  await searchForShowAndDisplay();
//});
//

$("#search-form").on("submit", async function handleSearch (evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await getShowsByTerm(query);

  populateShows(shows);
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) { 
  let response = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);

  let episodes = response.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number
  }));
  return episodes;

}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  let $episodesList = $("#episodes-list");
  $episodesList.empty();

  for (let episode of episodes){
    let $item = $(`<li>
    ${episode.name} (season ${episode.season}, episode ${episode.number})
    </li>`);
  $episodesList.append($item);
  }
  $("#episodes-area").show();
}

$("#shows-list").on("click",".get-episodes", async function handleClick (evt){
  let showId = $(evt.target).closest(".Show").data("show-id");
  let episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
})
