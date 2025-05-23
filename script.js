// canvas olculeri
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 1024;
canvas.height = 576;

// kazanma ve kaybetme durumlarında ortaya cıkan pencere ayarlari
const modal = document.createElement("div");
modal.style.position = "fixed";
modal.style.top = "0";
modal.style.left = "0";
modal.style.width = "100%";
modal.style.height = "100%";
modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
modal.style.display = "flex";
modal.style.justifyContent = "center";
modal.style.alignItems = "center";
modal.style.zIndex = "1000";
modal.style.flexDirection = "column";
modal.style.color = "white";
modal.style.fontFamily = "Arial";
modal.style.display = "none";

const modalContent = document.createElement("div");
modalContent.style.backgroundColor = "#222";
modalContent.style.padding = "40px";
modalContent.style.borderRadius = "10px";
modalContent.style.textAlign = "center";
modalContent.style.boxShadow = "0 0 20px rgba(0, 0, 0, 0.5)";
modalContent.style.maxWidth = "500px";

const modalTitle = document.createElement("h1");
modalTitle.style.fontSize = "32px";
modalTitle.style.marginBottom = "20px";

const modalMessage = document.createElement("p");
modalMessage.style.fontSize = "18px";
modalMessage.style.marginBottom = "30px";

const buttonContainer = document.createElement("div");
buttonContainer.style.display = "flex";
buttonContainer.style.justifyContent = "center";
buttonContainer.style.gap = "20px";

const restartButton = document.createElement("button");
restartButton.textContent = "Tekrar Oyna";
restartButton.style.padding = "10px 20px";
restartButton.style.fontSize = "16px";
restartButton.style.backgroundColor = "#4CAF50";
restartButton.style.color = "white";
restartButton.style.border = "none";
restartButton.style.borderRadius = "5px";
restartButton.style.cursor = "pointer";

buttonContainer.appendChild(restartButton);
modalContent.appendChild(modalTitle);
modalContent.appendChild(modalMessage);
modalContent.appendChild(buttonContainer);
modal.appendChild(modalContent);
document.body.appendChild(modal);

// tekrar oynama butonu
restartButton.addEventListener("click", () => {
    location.reload();
});


// dunya sınırları
const world = {
    width: 5000,
    height: 5000,
    originX: -2500,
    originY: -2500,
};

const keys = {
    left: { pressed: false },
    right: { pressed: false },
    up: { pressed: false },
    down: { pressed: false },
};

// toplanılacak malzemeler
const scores = {
    food1: 0,
    food2: 0,
    food3: 0,
    food4: 0,
    food5: 0,
};
const foodImages = {
    food1: new Image(),
    food2: new Image(),
    food3: new Image(),
    food4: new Image(),
    food5: new Image(),
};
foodImages.food1.src = "img/cin.png";
foodImages.food2.src = "img/adam_otu.png";
foodImages.food3.src = "img/kurbaga.png";
foodImages.food4.src = "img/mantar.png";
foodImages.food5.src = "img/ot.png";

const playerSprite = new Image();
playerSprite.src = "img/player_image.png";
const enemySprite = new Image();
enemySprite.src = "img/dusman_image.png";
const mcgonagallSprite = new Image();
mcgonagallSprite.src = "img/mcgonagal_image.png";
const kalp = new Image();
kalp.src = "img/kalp.png";
const cauldronSprite = new Image();
cauldronSprite.src = "img/kazan.png";

const add_sound = new Audio();
add_sound.src = "sounds/add_sound.mp3";
const gameover_sound = new Audio();
gameover_sound.src = "sounds/gameover_sound.mp3";
const background_sound = new Audio();
background_sound.src = "sounds/background_sound.mp3";
const hit_sound = new Audio();
hit_sound.src = "sounds/hit_sound.mp3";
const win_sound = new Audio();
win_sound.src = "sounds/win_sound.mp3";

// kazanma sartı için toplanması zorunlu malzeme adedi
let requiredMaterials = {
    food1: 5,
    food2: 5,
    food3: 5,
    food4: 5,
    food5: 5
};

let isGameWon = false;
let materialsInCauldron = { ...requiredMaterials };
Object.keys(materialsInCauldron).forEach(key => materialsInCauldron[key] = 0);


// kazana malzeme ekleme fonksiyonu
function addToCauldron() {
    const distToCauldron = distance_calculate(player.x, player.y, cauldron.x, cauldron.y);

    // oyuncu kazana yakın mı kontrol
    if (distToCauldron < 100) {
        let isAddmaterials = false;

        // tum malzemleri kontrol et
        Object.keys(requiredMaterials).forEach(type => {
            if (scores[type] > 0) {
                const numberAddedMaterial = Math.min(scores[type], requiredMaterials[type] - materialsInCauldron[type]);
                if (numberAddedMaterial > 0) {
                    scores[type] -= numberAddedMaterial;
                    materialsInCauldron[type] += numberAddedMaterial;
                    isAddmaterials = true;
                    add_sound.play();
                }
            }
        });

        //malzemeler kazana eklendiyse win the game mi bak
        if (isAddmaterials) {
            checkWinTheGame();
        }
    }
}

function checkWinTheGame() {
    const hasAllMaterials = Object.keys(requiredMaterials).every(type =>
        materialsInCauldron[type] >= requiredMaterials[type]
    );

    // zorunlu tum malzemeler varsa ve tarif alındıysa oyun kazanılmıştır
    if (hasAllMaterials && isGetRecipe) {
        isGameWon = true;
        background_sound.pause();
        win_sound.play();
        cancelAnimationFrame(animationId);
        showWinModal();
    }
}


var isGetRecipe = false;
//mcgonagalldan tarifi alma mesafe kontrol fonksiyonu
function getTheRecipe() {
    const mcgonagall_distance = distance_calculate(player.x, player.y, mcgonagall.x, mcgonagall.y);
    
    if (mcgonagall_distance < 150) {
        isGetRecipe = true;
        add_sound.play();
        checkWinTheGame();
    }
}

//oyun gameover penceresi
function showGameOverModal() {
    modalTitle.textContent = "Oyun Bitti!";
    modalMessage.textContent = "Üzgünüz, canınız kalmadı. İksiri tamamlayamadınız.";
    modal.style.display = "flex";
}

//oyun win game penceresi
function showWinModal() {
    modalTitle.textContent = "Tebrikler!";
    modalMessage.textContent = "İksiri başarıyla tamamladınız! Büyücülük yetenekleriniz harika!";
    modal.style.display = "flex";
}

//kazan için gerekli olcu ve animasyon tanımlamaları
const cauldron = {
    x: 0,
    y: 0,
    width: 80,
    height: 130,
    frameX: 0,
    maxFrame: 3,
    animationSpeed: 50,
    animationCounter: 0
};

//kazana rastgele bi konum atama
function placeTheCauldron() {
    const position = randomPosition();
    cauldron.x = position.x;
    cauldron.y = position.y;
}

//kazanı cizme ve animasyonunu yapma fonksiyonu
function updateAndDrawCauldron() {
    // animasyon sayacını güncelle
    cauldron.animationCounter++;
    if (cauldron.animationCounter >= cauldron.animationSpeed) {
        cauldron.frameX = (cauldron.frameX + 1) % cauldron.maxFrame;
        cauldron.animationCounter = 0;
    }

    // kazan cizme
    ctx.drawImage(
        cauldronSprite,
        cauldron.frameX * (cauldronSprite.width / 3),
        0,
        cauldronSprite.width / 3,
        cauldronSprite.height,
        cauldron.x - cauldron.width / 2,
        cauldron.y - cauldron.height / 2,
        cauldron.width,
        cauldron.height
    );
}


//kazan yerini gosteren yardımcı ok fonksiyonu
function drawCauldronPointer() {
    //dünya koordinatlarını ekran koordinatlarına çevirme
    const screenCauldronX = cauldron.x - (player.x - canvas.width / 2);
    const screenCauldronY = cauldron.y - (player.y - canvas.height / 2);

    // oyuncu ekran dışındaysa oku göster
    if (screenCauldronX < 0 || screenCauldronX > canvas.width ||
        screenCauldronY < 0 || screenCauldronY > canvas.height) {

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const angle = Math.atan2(
            screenCauldronY - centerY,
            screenCauldronX - centerX
        );

        // okun pozisyonu
        const radius = Math.min(canvas.width, canvas.height) / 2 - 30;
        const pointerX = centerX + Math.cos(angle) * radius;
        const pointerY = centerY + Math.sin(angle) * radius;

        // Ok çiz
        ctx.save();
        ctx.translate(pointerX, pointerY);
        ctx.rotate(angle);

        // Ok boyutları
        const arrowWidth = 40;
        const arrowHeight = 10;
        const headSize = 15;

        // Siyah kenar için ok çiz
        ctx.fillStyle = "black";
        ctx.beginPath();
        // Ok gövdesi
        ctx.moveTo(-arrowWidth / 2, -arrowHeight / 2 - 1);
        ctx.lineTo(arrowWidth / 2 - headSize, -arrowHeight / 2 - 1);
        // Ok başı
        ctx.lineTo(arrowWidth / 2 - headSize, -arrowHeight - 1);
        ctx.lineTo(arrowWidth / 2 + 1, 0);
        ctx.lineTo(arrowWidth / 2 - headSize, arrowHeight + 1);
        ctx.lineTo(arrowWidth / 2 - headSize, arrowHeight / 2 + 1);
        // Gövdenin altı
        ctx.lineTo(-arrowWidth / 2, arrowHeight / 2 + 1);
        ctx.closePath();
        ctx.fill();

        // Kırmızı iç için ok çiz
        ctx.fillStyle = "red";
        ctx.beginPath();
        // Ok gövdesi
        ctx.moveTo(-arrowWidth / 2 + 2, -arrowHeight / 2);
        ctx.lineTo(arrowWidth / 2 - headSize, -arrowHeight / 2);
        // Ok başı
        ctx.lineTo(arrowWidth / 2 - headSize, -arrowHeight);
        ctx.lineTo(arrowWidth / 2 - 2, 0);
        ctx.lineTo(arrowWidth / 2 - headSize, arrowHeight);
        ctx.lineTo(arrowWidth / 2 - headSize, arrowHeight / 2);
        // Gövdenin altı
        ctx.lineTo(-arrowWidth / 2 + 2, arrowHeight / 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
        ctx.restore();
    }
}


//oyuncu icin gerekli degiskenler
const player = {
    size: 40,
    velocity: { x: 0, y: 0 },
    speed: 6,
    color: "white",
    sprite: {
        width: 64, // karakter genişligi
        height: 96, // karakter yüksekligi
        frameX: 0, // Yatay frame indeksi
        frameY: 0, // Dikey frame indeksi
        maxFrameX: 3, // Yatay frame sayısı
        animationSpeed: 10, // Animasyon hızı
        animationCounter: 0,
        scale: 0.6, // karakter büyüklüğü
    },
    direction: "down", //varsayılan-default yon
    isHit: false,   // vurulma kontrolu
    hitTime: 0,
    hitDuration: 1000,
    hitFlashSpeed: 100,
};


//oyuncu sprite sheet cizim
function drawPlayer() {
    ctx.save();

    let shouldDrawPlayer = true;
    if (player.isHit) {     //yakalanma durumundaki çizim
        const timeSinceHit = Date.now() - player.hitTime;

        // vuruş süresi doldu mu
        if (timeSinceHit > player.hitDuration) {
            player.isHit = false;
        } else {
            // yanıp sönen karakter
            shouldDrawPlayer = Math.floor(timeSinceHit / player.hitFlashSpeed) % 2 === 0;

            // saydamlık için
            if (shouldDrawPlayer) {
                ctx.globalAlpha = 0.5;
            }
        }
    }

    if (shouldDrawPlayer) {
        //geneldeki karakter çizimi
        ctx.drawImage(
            playerSprite,
            player.sprite.frameX * player.sprite.width, // sx - sprite sheet'teki x pozisyonu
            player.sprite.frameY * player.sprite.height, // sy - sprite sheet'teki y pozisyonu
            player.sprite.width, // sw - sprite genişliği
            player.sprite.height, // sh - sprite yüksekliği
            player.x - (player.sprite.width * player.sprite.scale) / 2, // dx - ekrandaki x pozisyonu
            player.y - (player.sprite.height * player.sprite.scale) / 2, // dy - ekrandaki y pozisyonu
            player.sprite.width * player.sprite.scale, // dw - çizilecek genişlik
            player.sprite.height * player.sprite.scale // dh - çizilecek yükseklik
        );
    }

    ctx.restore();
}

// karakter yönüne göre sprite indeks güncelleme
function updatePlayer() {
    if (player.velocity.x === 0 && player.velocity.y === 0) {
        player.sprite.frameX = 0;
    } else {
        // hareket ediyorsa animasyon yap
        player.sprite.animationCounter++;
        if (player.sprite.animationCounter >= player.sprite.animationSpeed) {
            player.sprite.frameX =
                (player.sprite.frameX + 1) % player.sprite.maxFrameX;
            player.sprite.animationCounter = 0;
        }

        // yön belirleme
        if (Math.abs(player.velocity.x) > Math.abs(player.velocity.y)) {
            // yatay hareket baskın
            if (player.velocity.x > 0) {
                player.direction = "right";
                player.sprite.frameY = 2; // sağa dönük sprite
            } else {
                player.direction = "left";
                player.sprite.frameY = 1; // sola dönük sprite
            }
        } else {
            // dikey hareket daha baskın
            if (player.velocity.y > 0) {
                player.direction = "down";
                player.sprite.frameY = 0; // aşağı dönük sprite 
            } else {
                player.direction = "up";
                player.sprite.frameY = 3; // yukarı dönük sprite
            }
        }
    }
}


//rastgele konum ayarlama fonksiyonu
function randomPosition() {
    const margin = 100;
    const x = Math.random() * (world.width - margin * 2) + world.originX + margin;
    const y =
        Math.random() * (world.height - margin * 2) + world.originY + margin;
    return { x, y };
}

//her oyun rastgele belirlenen oyuncu konumu
const player_position = randomPosition();
player.x = player_position.x;
player.y = player_position.y;


//oyuncu hareketlerinin fark edilmesi için noktaların ekrana eklenmesi
function drawGrid() {
    const gridSize = 40;
    const dotRadius = 1.5;
    const offsetX = player.x % gridSize;
    const offsetY = player.y % gridSize;

    ctx.fillStyle = "rgba(100, 100, 100, 0.3)";
    for (let y = -offsetY; y < canvas.height; y += gridSize) {
        for (let x = -offsetX; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

//skorların ekranda gorunmesini saglayan fonksiyon
function drawScoreBoard() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    //sol ustte toplanan malzemeler
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.fillText("Toplanan Malzemeler", 20, 25);

    let leftYOffset = 45;
    Object.keys(scores).forEach((type) => {
        const img = foodImages[type];
        ctx.drawImage(img, 20, leftYOffset - 12, 20, 20);
        ctx.fillText(`x ${scores[type]}`, 50, leftYOffset + 2);
        leftYOffset += 30;
    });

    //sag ustte can sayacı
    ctx.fillStyle = "red";
    ctx.font = "bold italic 16px Arial";
    ctx.drawImage(kalp, canvas.width - 130, 20, 20, 20);
    ctx.fillText(":  " + live_number, canvas.width - 100, 35);


    //sol altta kazana eklenen malzemeler
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.fillText("Kazandaki Malzemeler", 20, canvas.height - 160);

    let rightYOffset = canvas.height - 140;
    Object.keys(materialsInCauldron).forEach((type) => {
        const img = foodImages[type];
        ctx.drawImage(img, 20, rightYOffset - 12, 20, 20);
        ctx.fillText(`${materialsInCauldron[type]}/${requiredMaterials[type]}`, 50, rightYOffset + 2);
        rightYOffset += 30;
    });

    ctx.restore();
}


//rastgele konumlara 10 adet tum malzemelerden yerleştir
let foods = [];
function placeTheFoods() {
    const foodTypes = ["food1", "food2", "food3", "food4", "food5"];
    foodTypes.forEach((type) => {
        for (let i = 0; i < 10; i++) {
            const material_position = randomPosition();
            foods.push({
                type: type,
                x: material_position.x,
                y: material_position.y,
            });
        }
    });
}
placeTheFoods();


//iki cisim arası memsafe hesaplama fonksiyonu
function distance_calculate(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}


//dusman-snape için gerekli degişkenler
const enemy = {
    x: player.x + 250,
    y: player.y + 250,
    size: 40,
    color: "red",
    speed: 5,
    sprite: {
        width: 64,
        height: 96, 
        frameX: 0, 
        frameY: 0, 
        maxFrameX: 3, 
        animationSpeed: 10, 
        animationCounter: 0,
        scale: 0.6, 
    },
    direction: "down",
};


function drawEnemy() {
    ctx.drawImage(
        enemySprite,
        enemy.sprite.frameX * enemy.sprite.width, // sx - sprite sheet'teki x pozisyonu
        enemy.sprite.frameY * enemy.sprite.height, // sy - sprite sheet'teki y pozisyonu
        enemy.sprite.width, // sw - sprite genişliği
        enemy.sprite.height, // sh - sprite yüksekliği
        enemy.x - (enemy.sprite.width * enemy.sprite.scale) / 2, // dx - ekrandaki x pozisyonu
        enemy.y - (enemy.sprite.height * enemy.sprite.scale) / 2, // dy - ekrandaki y pozisyonu
        enemy.sprite.width * enemy.sprite.scale, // dw - çizilecek genişlik
        enemy.sprite.height * enemy.sprite.scale // dh - çizilecek yükseklik
    );
}

//dusman sprite guncelleme fonksiyonu
function updateEnemy() {
    let targetX, targetY;

    if (enemy_remove) {     //eger dusman silinecekse
        // oyuncudan uzaklaşacak şekilde hedef belirle
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const retreatDistance = 400;

        const dist = Math.hypot(dx, dy);
        targetX = enemy.x + (dx / dist) * retreatDistance;
        targetY = enemy.y + (dy / dist) * retreatDistance;
    } else {
        // normalde oyuncuya yaklas
        targetX = player.x;
        targetY = player.y;
    }

    const dx = targetX - enemy.x;
    const dy = targetY - enemy.y;
    const distanceToPlayer = Math.hypot(dx, dy);

    if (distanceToPlayer > 1) {
        enemy.x += (dx / distanceToPlayer) * enemy.speed;
        enemy.y += (dy / distanceToPlayer) * enemy.speed;

        // animasyon sayac artırma
        enemy.sprite.animationCounter++;
        if (enemy.sprite.animationCounter >= enemy.sprite.animationSpeed) {
            enemy.sprite.frameX = (enemy.sprite.frameX + 1) % enemy.sprite.maxFrameX;
            enemy.sprite.animationCounter = 0;
        }

        // harekete göre sprite'ı ayarla
        if (Math.abs(dx) > Math.abs(dy)) {
            // yatay hareket baskın
            if (dx > 0) {
                enemy.direction = "right";
                enemy.sprite.frameY = 2; // sağ sprite
            } else {
                enemy.direction = "left";
                enemy.sprite.frameY = 1; // sol sprite
            }
        } else {
            // dikey hareket daha baskın
            if (dy > 0) {
                enemy.direction = "down";
                enemy.sprite.frameY = 0; // aşağı sprite 
            } else {
                enemy.direction = "up";
                enemy.sprite.frameY = 3; // yukarı sprite 
            }
        }
    } else {
        enemy.sprite.frameX = 0;
    }
}

//snape'in ortaya çıkacagı zamanı ve ekranda kalma suresini belirleyen fonksiyon
function activateEnemy() {
    enemyActive = true;
    enemy_remove = false;
    enemy.x = player.x + 250;
    enemy.y = player.y + 250;

    // bi sure sonra dusman kaybolsun
    if (enemyTimer) clearTimeout(enemyTimer);
    enemyTimer = setTimeout(() => {
        enemy_remove = true; 
        setTimeout(() => {
            enemyActive = false; // 3 saniye sonra tamamen silinsin
            enemy_remove = false;
        }, 3000);
    }, 10000); // 10 saniye sonra uzaklaşsın
}


// dusmana yakalanma fonksiyonu
function startHitAnimation() {
    player.isHit = true;
    player.hitTime = Date.now();
    hit_sound.play();

}

//mcgonagall için gerekli degişkenler
//mcgonagall oyun basında ekranda karaktere yakın gorunur ve sonra belli bi alanda devriye gezer
const mcgonagall_position = randomPosition();
const mcgonagall = {
    x: player.x + 200,
    y: player.y + 200,
    size: 40,
    sprite: {
        width: 64,
        height: 96,
        frameX: 0,
        frameY: 0,
        maxFrameX: 3,
        animationSpeed: 10,
        animationCounter: 0,
        scale: 0.6,
    },
    direction: "down",
    moveSpeed: 2,
    currentDirection: { x: 1, y: 0 }, 
    directionChangeTimer: 0,
    directionChangeDuration: 3000, 
    lastDirectionChangeTime: 0,
    patrolArea: {
        centerX: mcgonagall_position.x,
        centerY: mcgonagall_position.y,
        radius: 200 // devriye gezdiği maksimum yarıçap
    }
};


function drawMcgonagall() {
    ctx.drawImage(
        mcgonagallSprite,
        mcgonagall.sprite.frameX * mcgonagall.sprite.width, // sx - sprite sheet'teki x pozisyonu
        mcgonagall.sprite.frameY * mcgonagall.sprite.height, // sy - sprite sheet'teki y pozisyonu
        mcgonagall.sprite.width, // sw - sprite genişliği
        mcgonagall.sprite.height, // sh - sprite yüksekliği
        mcgonagall.x - (mcgonagall.sprite.width * mcgonagall.sprite.scale) / 2, // dx - ekrandaki x pozisyonu
        mcgonagall.y - (mcgonagall.sprite.height * mcgonagall.sprite.scale) / 2, // dy - ekrandaki y pozisyonu
        mcgonagall.sprite.width * mcgonagall.sprite.scale, // dw - çizilecek genişlik
        mcgonagall.sprite.height * mcgonagall.sprite.scale // dh - çizilecek yükseklik
    );
}

//mcgonagellın devriye gezmesini saglayan fonksiyon
function updateMcgonagall() {
    const now = Date.now();
    
    // yönü belirli aralıklarla değiştir
    if (now - mcgonagall.lastDirectionChangeTime > mcgonagall.directionChangeDuration) {
        mcgonagall.lastDirectionChangeTime = now;
        
        // devriye alanı dışına cıkarsa merkeze doğru yaklas
        const distanceFromCenter = distance_calculate(
            mcgonagall.x, 
            mcgonagall.y, 
            mcgonagall.patrolArea.centerX, 
            mcgonagall.patrolArea.centerY
        );
        
        if (distanceFromCenter > mcgonagall.patrolArea.radius) {
            // merkeze doğru yön
            const dx = mcgonagall.patrolArea.centerX - mcgonagall.x;
            const dy = mcgonagall.patrolArea.centerY - mcgonagall.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            mcgonagall.currentDirection = {
                x: dx / length,
                y: dy / length
            };
        } else {
            // rastgele yeni bir yön seçimi
            const directions = [
                { x: 1, y: 0 },    // sağ
                { x: -1, y: 0 },   // sol
                { x: 0, y: 1 },    // aşağı
                { x: 0, y: -1 },   // yukarı
                { x: 1, y: 1 },    // sağ aşağı
                { x: 1, y: -1 },   // sağ yukarı
                { x: -1, y: 1 },   // sol aşağı
                { x: -1, y: -1 }   // sol yukarı
            ];
            
            const randomIndex = Math.floor(Math.random() * directions.length);
            mcgonagall.currentDirection = directions[randomIndex];
            
            // capraz yönler için hızı ayarlama
            if (mcgonagall.currentDirection.x !== 0 && mcgonagall.currentDirection.y !== 0) {
                const factor = 1 / Math.sqrt(2);
                mcgonagall.currentDirection.x *= factor;
                mcgonagall.currentDirection.y *= factor;
            }
        }
    }
    
    // mcgonagallin pozisyon güncellemesi
    mcgonagall.x += mcgonagall.currentDirection.x * mcgonagall.moveSpeed;
    mcgonagall.y += mcgonagall.currentDirection.y * mcgonagall.moveSpeed;
    
    // dünya sınırları içinde tutma
    mcgonagall.x = Math.max(
        world.originX + mcgonagall.size / 2,
        Math.min(mcgonagall.x, world.originX + world.width - mcgonagall.size / 2)
    );
    mcgonagall.y = Math.max(
        world.originY + mcgonagall.size / 2,
        Math.min(mcgonagall.y, world.originY + world.height - mcgonagall.size / 2)
    );
    

    // yönü ayarlama ve sprite güncelleme
    if (Math.abs(mcgonagall.currentDirection.x) > Math.abs(mcgonagall.currentDirection.y)) {
        if (mcgonagall.currentDirection.x > 0) {
            mcgonagall.direction = "right";
            mcgonagall.sprite.frameY = 2;
        } else {
            mcgonagall.direction = "left";
            mcgonagall.sprite.frameY = 1;
        }
    } else {
        // Dikey hareket daha belirgin
        if (mcgonagall.currentDirection.y > 0) {
            mcgonagall.direction = "down";
            mcgonagall.sprite.frameY = 0;
        } else {
            mcgonagall.direction = "up";
            mcgonagall.sprite.frameY = 3;
        }
    }
    
    // animasyon
    mcgonagall.sprite.animationCounter++;
    if (mcgonagall.sprite.animationCounter >= mcgonagall.sprite.animationSpeed) {
        mcgonagall.sprite.frameX = (mcgonagall.sprite.frameX + 1) % mcgonagall.sprite.maxFrameX;
        mcgonagall.sprite.animationCounter = 0;
    }
}





let lastTime = 0;
var live_number = 3;
let isGameOver = false;
let enemyActive = false;
let enemyTimer = null;
let enemy_remove = false;
let animationId;
let showPointer = false;
let pointerLastShownTime = 0;

// oyunu anime eden ana kod
function animate() {
    background_sound.play();
    animationId = requestAnimationFrame(animate);

    player.velocity.x = 0;
    player.velocity.y = 0;

    //karakter sag-sol-alt-ust hareketi
    if (keys.left.pressed) player.velocity.x = -player.speed;
    if (keys.right.pressed) player.velocity.x = player.speed;
    if (keys.up.pressed) player.velocity.y = -player.speed;
    if (keys.down.pressed) player.velocity.y = player.speed;

    //x ve y hızı (ikiside) varsa capraz yon ayarı
    if (player.velocity.x !== 0 && player.velocity.y !== 0) {
        const factor = 1 / Math.sqrt(2);
        player.velocity.x *= factor;
        player.velocity.y *= factor;
    }

    player.x += player.velocity.x;
    player.y += player.velocity.y;

    // oyuncunun dünya sınırları içinde kalması için kısıtlama
    player.x = Math.max(
        world.originX + player.size / 2,
        Math.min(player.x, world.originX + world.width - player.size / 2)
    );
    player.y = Math.max(
        world.originY + player.size / 2,
        Math.min(player.y, world.originY + world.height - player.size / 2)
    );

    //oyuncu sprite'ını güncelle
    updatePlayer();

    //arka plan ayarlama, grid cizimi
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#DBCDC2FF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    drawGrid();

    ctx.translate(canvas.width / 2 - player.x, canvas.height / 2 - player.y);


    // Ok'la kazan yeri gosterme yardımı
    const now = performance.now(); 
    // 15 saniye aralıklarla 2 saniye okla kazan yerini goster
    if (now - pointerLastShownTime > 15000) {
        pointerLastShownTime = now;
        showPointer = true;
    }
    if (showPointer && now - pointerLastShownTime < 2000) {
        drawCauldronPointer();
    } else {
        showPointer = false;
    }

    //toplanacak malzemelerin cizimi
    foods.forEach((food) => {
        const image = foodImages[food.type];
        ctx.drawImage(image, food.x, food.y, 45, 45);    //malzeme boyutu ayarlama
    });

    updateAndDrawCauldron();

    //malzemelerin toplanma kontrolu
    for (let i = foods.length - 1; i >= 0; i--) {
        const food = foods[i];
        const dist = distance_calculate(
            player.x,
            player.y,
            food.x + 25,
            food.y + 25
        );
        if (dist < player.size / 2 + 25) {
            if (food.type === "food3" && !enemyActive) {        //ucuncu malzeme toplandıgında ise dusmanı aktifleştir
                activateEnemy();
            }
            scores[food.type]++;
            foods.splice(i, 1);
            add_sound.play();
        }
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 5;
    ctx.strokeRect(world.originX, world.originY, world.width, world.height);

    // Karakteri çiz
    drawPlayer();
    //mcgonagallı çiz ve guncelle
    updateMcgonagall();
    drawMcgonagall();


    // can sayacı ve game over durum kontrolü
    const distToEnemy = distance_calculate(player.x, player.y, enemy.x, enemy.y);
    if (distToEnemy < (player.size + enemy.size) / 2 && !isGameOver && enemyActive) {
        if (!player.isHit) {        // eğer vuruş animasyonu yoksa
            live_number--;
            startHitAnimation(); // vuruş animasyonunu başlat

            //can sayısı bitince game over durumu
            if (live_number <= 0) { 
                isGameOver = true;
                background_sound.pause();
                gameover_sound.play();
                cancelAnimationFrame(animationId);
                showGameOverModal();
                return;
            } else {
                // dusmana yakalandı ama daha canı varsa dusman biraz uzaklaşıp tekrar kovalasın
                enemy.x = player.x + 250;
                enemy.y = player.y + 250;
            }
        }
    }

    //mcgonagalldan tarf alma yonlendiricisi
    const mcgonagall_distance = distance_calculate(player.x, player.y, mcgonagall.x, mcgonagall.y);
    if (mcgonagall_distance < 150) {
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("İksir Tarifini Al - Q", mcgonagall.x - 100, mcgonagall.y - 40);
    }

    //kazana malzeme atma yonlendiricisi
    const showCauldronHint = distance_calculate(player.x, player.y, cauldron.x, cauldron.y) < 150;
    if (showCauldronHint) {
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("Malzemeleri Kazana At - E", cauldron.x - 100, cauldron.y - 40);
    }

    drawScoreBoard();

    //dusman aktif edildiğinde ciz ve guncelle
    if (enemyActive) {
        drawEnemy();
        updateEnemy();
    }

    ctx.restore();
    if (isGameWon) return; // oyun kazanıldıysa güncellemeyi durdur
}

// sprite sheetlerin yüklenmesini bekleyerek oyunu başlat
let spritesLoaded = 0;
const totalSprites = 4;

function startGame() {
    spritesLoaded++;
    if (spritesLoaded >= totalSprites) {
        placeTheCauldron();         // oyun başlangıcında kazanı rastgele yerlestır
        animate();
    }
}
playerSprite.onload = startGame;
enemySprite.onload = startGame;
cauldronSprite.onload = startGame;
mcgonagallSprite.onload = startGame;


// tuş kontrolleri
addEventListener("keydown", ({ keyCode }) => {
    if (keyCode === 65) keys.left.pressed = true;
    if (keyCode === 68) keys.right.pressed = true;
    if (keyCode === 87) keys.up.pressed = true;
    if (keyCode === 83) keys.down.pressed = true;
    if (keyCode === 69) addToCauldron();
    if (keyCode === 81) getTheRecipe();
});

addEventListener("keyup", ({ keyCode }) => {
    if (keyCode === 65) keys.left.pressed = false;
    if (keyCode === 68) keys.right.pressed = false;
    if (keyCode === 87) keys.up.pressed = false;
    if (keyCode === 83) keys.down.pressed = false;
});

