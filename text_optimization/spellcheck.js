var nspell = require("nspell");
var loadDictionary = require("./dictionary-loader.js");

// function splitIntoWords(text) {
//     //splits text into words
//     return text.match(/(\s+ | [A-Za-z]+ |[^\sA-Za-z])/g || [text]);
// }

// function isWordToken(token) {
//     return /^[A-Za-z]+$/.test(token);
// }

// #1: CORRECT SPELLING

//create spellchecker instance
let spell = null;
let dictionary = null;

function initSpellChecker() {
    return new Promise(function(resolve, reject) {
        if (spell) {
            resolve(spell);
            return;
        }
        
        if (dictionary) {
            spell = nspell(dictionary);
            resolve(spell);
            return;
        }
        
        loadDictionary().then(function(dict) {
            dictionary = dict;
            
            // Verify dictionary format
            if (!dict || !dict.aff || !dict.dic) {
                console.error('Spellcheck: Invalid dictionary format:', dict);
                reject(new Error('Invalid dictionary format'));
                return;
            }
            
            console.log('Spellcheck: Initializing nspell with dictionary');
            console.log('Spellcheck: Aff file type:', typeof dict.aff, 'length:', dict.aff ? dict.aff.length : 0);
            console.log('Spellcheck: Dic file type:', typeof dict.dic, 'length:', dict.dic ? dict.dic.length : 0);
            
            try {
                spell = nspell(dict);
                
                // Test multiple words to verify dictionary is working
                var testWords = [
                    { word: 'hello', shouldBeCorrect: true },
                    { word: 'the', shouldBeCorrect: true },
                    { word: 'and', shouldBeCorrect: true },
                    { word: 'to', shouldBeCorrect: true },
                    { word: 'of', shouldBeCorrect: true },
                    { word: 'should', shouldBeCorrect: true },
                    { word: 'many', shouldBeCorrect: true },
                    { word: 'produce', shouldBeCorrect: true },
                    { word: 'approach', shouldBeCorrect: true },
                    { word: 'xyzabc123', shouldBeCorrect: false },
                    { word: 'beleev', shouldBeCorrect: false }
                ];
                
                console.log('Spellcheck: Testing dictionary with multiple words (dictionary initialization test):');
                var allTestsPassed = true;
                testWords.forEach(function(test) {
                    var result = spell.correct(test.word);
                    var passed = (result === test.shouldBeCorrect);
                    if (!passed) {
                        allTestsPassed = false;
                        console.warn('Spellcheck: Dictionary test failed for "' + test.word + '": expected ' + test.shouldBeCorrect + ', got ' + result);
                    } else {
                        console.log('Spellcheck: [Dictionary Test] ✓ "' + test.word + '" correctly identified as ' + (result ? 'correct' : 'incorrect'));
                    }
                });
                
                if (!allTestsPassed) {
                    console.error('Spellcheck: Some dictionary tests failed! Dictionary may not be working correctly.');
                } else {
                    console.log('Spellcheck: All dictionary tests passed!');
                }
                
                resolve(spell);
            } catch (error) {
                console.error('Spellcheck: Error initializing nspell:', error);
                reject(error);
            }
        }).catch(function(error) {
            console.error('Spellcheck: Failed to load dictionary:', error);
            reject(error);
        });
    });
}

function getSpellingSuggestions(word) {
    return new Promise(function(resolve, reject) {
        // Make sure spellchecker is ready
        if (!spell) {
            initSpellChecker().then(function() {
                checkWord(word, resolve, reject);
            }).catch(reject);
        } else {
            checkWord(word, resolve, reject);
        }
    });
}

function checkWord(word, resolve, reject) {
    try {
        if (!spell) {
            reject(new Error('Spell checker not initialized'));
            return;
        }
        
        var lower = String(word || "").toLowerCase().trim();
        
        // Skip empty or very short words (they're often false positives)
        if (lower.length < 2) {
            resolve({
                correct: true,
                suggestions: []
            });
            return;
        }
        
        // Remove punctuation from the end of words (but keep apostrophes for contractions)
        var cleanedWord = lower.replace(/[^\w']+$/, '');
        if (cleanedWord.length < 2) {
            resolve({
                correct: true,
                suggestions: []
            });
            return;
        }

        var isCorrect = spell.correct(cleanedWord);
        
        if (isCorrect) {
            resolve({
                correct: true,
                suggestions: []
            });
        } else {
            var suggestions = spell.suggest(cleanedWord);
            
            // Debug: log if common words are being flagged
            var commonWords = ['to', 'of', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'for', 'with', 'should', 'many', 'produce', 'approach', 'pointed', 'careful', 'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can'];
            if (commonWords.indexOf(cleanedWord) !== -1) {
                console.warn('Spellcheck: Common word flagged as misspelling:', cleanedWord, 'original:', word, 'suggestions:', suggestions.length);
                // If it's a common word and has no suggestions, it's likely a false positive
                if (suggestions.length === 0) {
                    console.warn('Spellcheck: Common word has no suggestions - treating as correct');
                    resolve({
                        correct: true,
                        suggestions: []
                    });
                    return;
                }
            }
            
            resolve({
                correct: false,
                suggestions: suggestions
            });
        }
    } catch (error) {
        console.error('Spellcheck error checking word:', word, error);
        reject(error);
    }
}

/**
 * Synchronous spellcheck function - returns array of suggestions
 * If array length > 0, word is misspelled
 * If array length === 0, word is correct
 */
function spellcheck(word) {
    if (!spell) {
        console.warn('Spellcheck: Spell checker not initialized yet');
        return [];
    }
    
    try {
        var lower = String(word || "").toLowerCase().trim();
        
        // Skip empty or very short words
        if (lower.length < 2) {
            return [];
        }
        
        // Remove punctuation from the end of words (but keep apostrophes for contractions)
        var cleanedWord = lower.replace(/[^\w']+$/, '');
        if (cleanedWord.length < 2) {
            return [];
        }
        
        var isCorrect = spell.correct(cleanedWord);
        
        if (isCorrect) {
            return [];
        } else {
            var suggestions = spell.suggest(cleanedWord);
            
            // If it's a common word and has no suggestions, it's likely a false positive
            var commonWords = ['want', 'to', 'of', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'for', 'with', 'should', 'many', 'produce', 'approach', 'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'may', 'might', 'must', 'can'];
            if (commonWords.indexOf(cleanedWord) !== -1 && suggestions.length === 0) {
                console.warn('Spellcheck: Common word "' + cleanedWord + '" flagged as incorrect with no suggestions - treating as correct');
                return [];
            }
            
            // If the word is in its own suggestions, it's likely a false positive
            if (suggestions.indexOf(cleanedWord) !== -1) {
                console.warn('Spellcheck: Word "' + cleanedWord + '" is in its own suggestions - likely false positive');
                return [];
            }
            
            return suggestions;
        }
    } catch (error) {
        console.error('Spellcheck error checking word:', word, error);
        return [];
    }
}

module.exports = {
    initSpellChecker: initSpellChecker,
    getSpellingSuggestions: getSpellingSuggestions,
    spellcheck: spellcheck
};

// #2: DELETING UNECESSARY WORDS


