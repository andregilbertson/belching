import { initSpellChecker, getSpellingSuggestions } from "./text_optimizer_functions.js";

async function run() {
    await initSpellChecker();
    
    console.log(await getSpellingSuggestions("enviornment")); //incorrect letter switch
    console.log(await getSpellingSuggestions("hello")); //correct
    console.log(await getSpellingSuggestions("beleev")); //multiple suggestions test
    console.log(await getSpellingSuggestions("oaieaohaofhaoi"));
    console.log(await getSpellingSuggestions("wrld")); //one letter lost
    console.log(await getSpellingSuggestions("h")); //unclear word
}

run();