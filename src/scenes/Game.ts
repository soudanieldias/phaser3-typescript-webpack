import Phaser from 'phaser';

export default class Demo extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }
  
  private player: Phaser.Physics.Arcade.Sprite;

  private platforms: Phaser.Physics.Arcade.StaticGroup;

  private scoreText: any;

  private scoreValue: number = 0;

  private levelText: any;

  private levelValue: number = 1;

  private stars: Phaser.Physics.Arcade.Group;

  private bombs: Phaser.Physics.Arcade.Group;

  private backgroundSong: Phaser.Sound.BaseSound;

  private powerUpSong: Phaser.Sound.BaseSound;

  private deathSong: Phaser.Sound.BaseSound;

  private collectSong: Phaser.Sound.BaseSound;

  private cursors: any;

  private restartButton: any;

  public preload () { // Preload of elements used in game (images, songs, etc)
    // Images
    this.load.image('sky', '/assets/sky.png');
    this.load.image('ground', '/assets/platform.png');
    this.load.image('star', '/assets/star.png');
    this.load.image('form', '/assets/forms.png');

    // Sprites
    this.load.spritesheet('dude', '/assets/dude.png', { frameWidth: 32, frameHeight: 48 });

    // Audios - Songs - Effects
    this.load.audio('backgroundSong', ['/assets/audio/backgroundSong.mp3']);
    this.load.audio('powerUp', ['assets/audio/powerup.mp3']);
    this.load.audio('deathSong', ['assets/audio/death.mp3']);
    this.load.audio('collectSong', ['assets/audio/coin.mp3']);
  }

  public create () { // Assignment & Bind of elements to Scene
    // Images
    this.add.image(400, 300, 'sky');
    
    // Elements
    // Element - Platforms
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'ground').setScale(3).refreshBody();
    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');

    // Element - Player
    this.player = this.physics.add.sprite(100, 450, 'dude');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Element - Bombs
    this.bombs = this.physics.add.group();
  
    // Element - scoreText & scoreValue
    this.scoreText = this.add.text(16, 20, 'score: 0', { fontSize: '32px', color: '#000' });
    // var scoreValue = 0;

    // Element - levelText & levelValue
    this.levelText = this.add.text(16, 50, 'Level: 1', { fontSize: '32px', color: '#000' });
    // var levelValue = 1;

    // Element - Stars
    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    });

    this.generateStars();

    // Element - restartButton
    this.restartButton = this.add.text(600, 20, 'Restart', { fontSize: '32px', color: '#000' })
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => { this.backgroundSong.stop(); this.scene.restart() })
    .on('pointerover', () => this.restartButton.setStyle({ color: '#f39c12' }))
    .on('pointerout', () => this.restartButton.setStyle({ color: '#FFF' }))

    // Colliders (Collision Events)
    this.physics.add.collider(this.player, this.platforms); // Collision of Players -> Platform
    this.physics.add.collider(this.bombs, this.platforms); // Collision of Bombs -> Platform
    this.physics.add.collider(this.stars, this.platforms); // Collision of Stars -> Platform
    this.physics.add.collider(this.player, this.bombs, this.bombHit, undefined, this);

    // Overlaps
    this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this);
  
    // Animations
    // Animation - Player
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 20,
      repeat: -1
    });

    this.anims.create({
      key: 'turn',
      frames: [ { key: 'dude', frame: 4 } ],
      frameRate: 30
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 20,
      repeat: -1
    });

    // Audios - Songs - Effects
    this.backgroundSong = this.sound.add('backgroundSong', {volume: 0.3});
    this.backgroundSong.play();
    this.powerUpSong = this.sound.add('powerUp');
    this.deathSong = this.sound.add('deathSong');
    this.collectSong = this.sound.add('collectSong');

    // Events
    // Event - Cursor
    this.cursors = this.input.keyboard.createCursorKeys();

  }

  public update () {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('left', true);

    } else if (this.cursors.right.isDown) {
       this.player.setVelocityX(160);
      this.player.anims.play('right', true);

    } else {
       this.player.setVelocityX(0);
      this.player.anims.play('turn');

    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  private generateStars () {
    this.stars.children.iterate((child) => {
      (child as Phaser.Physics.Arcade.Sprite).setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
  }

  private enableStars () {
    this.stars.children.iterate((child) => {
      child.enableBody(true, child.x, 0, true, true);
    });
  }

  private generateBomb () {
    const x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    const newBomb = this.bombs.create(x, 16, 'form');

    newBomb.setBounce(1);
    newBomb.setCollideWorldBounds(true);
    newBomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    newBomb.setScale(0.5);
  }

  private bombHit () {
    this.physics.pause();
    this.backgroundSong.stop();
    this.player.setTint(0xff0000);
    this.player.anims.play('turn');
    this.deathSong.play();
  }

  private collectStar (_player:any, star:any) {
    star.disableBody(true, true);

    this.scoreValue += 10;
    this.scoreText.setText('Score: ' + this.scoreValue);
    this.collectSong.play();

    if (this.stars.countActive(true) === 0) {
      this.powerUpSong.play();
      this.levelValue += 1;
      this.levelText.setText('Level: ' + this.levelValue);
      this.enableStars();
      this.generateBomb();
    }
  }
}
