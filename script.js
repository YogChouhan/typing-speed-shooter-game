$(document).ready(function() {
    const listofWords = ["aurora","blaze","cipher","drift","ember","fusion","glitch","harbor","ignite","jungle","karma","lunar","mirage","nebula","orbit","phantom","quartz","ripple","spectrum","terra","utopia","vortex","wander","xenon","yonder","zenith","atlas","binary","cascade","delta","eclipse","flux","gravity","halo","infinity","jolt","keystone","legend","momentum","nova","onyx","pulse","quantify","resonance","solstice","tundra","umbra","vector","wave","zen"];

    const $container = $('#game-container');
    const $input = $('#text-input');
    const $scoreBoard = $('#score');
    const $livesBoard = $('#lives'); 

    let score = 0;
    let lives = 3;
    let activeWords = []; 
    let spawnInterval; 
    let isGameOver = false;
    let spawntime = 3000;

    function getRandomWord() {
        const index = Math.floor(Math.random() * listofWords.length);
        return listofWords[index];
    }

    function spawnWord() {
        if (isGameOver) return; // Stop spawning if game is over

        const wordText = getRandomWord();
        const maxX = $(window).width() - 200; 
        const maxY = $(window).height() - 300; 
        const randomX = Math.floor(Math.random() * maxX)+20;
        const randomY = Math.floor(Math.random() * maxY)+80;

        const $wordEl = $('<div>', {
            class: 'word',
            text: wordText
        }).css({
            left: randomX + 'px',
            top: randomY + 'px'
        });

        $container.append($wordEl);
        
        const wordObj = { $element: $wordEl, text: wordText };
        activeWords.push(wordObj);

        // --- THE LIFESPAN / DEATH LOGIC ---
        setTimeout(() => {
            if (isGameOver) return;

            if ($.contains(document, $wordEl[0])) {
                $wordEl.remove(); 
                activeWords = activeWords.filter(w => w !== wordObj); 
                $input.val('');
                
                lives--;
                updateLivesDisplay();

                spawntime += 400;
                clearInterval(spawnInterval);
                spawnInterval = setInterval(spawnWord, spawntime);

                $container.addClass('flash-red');
                $livesBoard.addClass('shake');

                setTimeout(() => {
                    $container.removeClass('flash-red');
                    $livesBoard.removeClass('shake');
                }, 400); 

                if (lives <= 0 && !isGameOver) {
                    gameOver();
                }
            }
        }, spawntime+1000);
    }

    function updateLivesDisplay() {
        const currentLives = Math.max(0, lives); 
        const hearts = '❤️'.repeat(currentLives) + '🖤'.repeat(3 - currentLives);
        $livesBoard.text(hearts);
    }

    function gameOver() {
        isGameOver = true;
        clearInterval(spawnInterval); 
        $input.prop('disabled', true); 
        
        // Remove remaining words
        $('.word').remove(); 
        localStorage.setItem('playerScore', score);
        $('body').fadeOut(500, function() {
            window.location.href = 'gg.html';
        });
        
    }

    spawnInterval = setInterval(spawnWord, spawntime);


    $input.on('input', function() {
        const typedText = $(this).val().trim().toLowerCase();
        const matchIndex = activeWords.findIndex(w => w.text === typedText);

        if (matchIndex !== -1) {
            const matchedWord = activeWords[matchIndex];
            
            const $pointsEl = $('<div>', {
                class: 'points-popup',
                text: '+10'
            }).css({
                left: matchedWord.$element.css('left'),
                top: matchedWord.$element.css('top')
            });
            
            $container.append($pointsEl);

            setTimeout(() => {
                $pointsEl.remove();
            }, 1000);

            matchedWord.$element.remove(); 
            activeWords.splice(matchIndex, 1); 
            
            score += 10;

            if(score%50==0){
                $scoreBoard.addClass('highlight-score');
                $scoreBoard.text(score);

                setTimeout(()=>{
                    $scoreBoard.removeClass('highlight-score');
                },1750)
                if (spawntime>1500){
                    spawntime = Math.max(1500, spawntime - 400);
                    clearInterval(spawnInterval);
                    spawnInterval = setInterval(spawnWord, spawntime);
                }
            }
            else{
                $scoreBoard.text(score);
            }

            $(this).val(''); 
        }
    });
});