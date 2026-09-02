const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const seedData = async () => {
  try {
    const postCount = await Post.countDocuments();
    if (postCount > 0) {
      console.log(`[Database] Existing data found (${postCount} posts). Skipping automatic seed.`);
      return;
    }

    console.log('🌱 Database is empty. Seeding initial photography community demo data...');

    const user1 = await User.create({
      username: 'elena_rodriguez',
      name: 'Elena Rodriguez',
      email: 'elena@framora.art',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=85',
      bio: 'Landscape & astrophotographer traveling through the Andes & Patagonia. Seeking golden hours and dark skies.',
      location: 'Bariloche, Argentina',
      website: 'https://elenaphoto.art',
      role: 'user',
    });

    const user2 = await User.create({
      username: 'kai_takahashi',
      name: 'Kai Takahashi',
      email: 'kai@framora.art',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=85',
      bio: 'Cyberpunk nights, neon reflections, and quiet alleyways of Tokyo. 35mm & digital shooter.',
      location: 'Tokyo, Japan',
      website: 'https://kaitakahashi.photos',
      role: 'user',
    });

    const user3 = await User.create({
      username: 'maya_chen',
      name: 'Maya Chen',
      email: 'maya@framora.art',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=85',
      bio: 'Wildlife conservation storyteller. Documenting endangered species and untouched natural habitats.',
      location: 'Nairobi, Kenya',
      website: 'https://mayachenwildlife.org',
      role: 'user',
    });

    const user4 = await User.create({
      username: 'marcus_vance',
      name: 'Marcus Vance',
      email: 'marcus@framora.art',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85',
      bio: 'Architectural geometry & minimalist urban portraits. Sony Artisan of Imagery.',
      location: 'Berlin, Germany',
      website: 'https://marcusvance.de',
      role: 'admin',
    });

    // Follow relationships
    user1.following.push(user2._id, user3._id);
    user1.followers.push(user2._id, user4._id);
    await user1.save();

    user2.following.push(user1._id, user4._id);
    user2.followers.push(user1._id, user3._id);
    await user2.save();

    user3.following.push(user1._id);
    user3.followers.push(user1._id);
    await user3.save();

    user4.following.push(user1._id, user2._id);
    user4.followers.push(user2._id);
    await user4.save();

    const post1 = await Post.create({
      user: user1._id,
      title: 'First Light Over Mount Fitz Roy',
      caption: 'Woke up at 3:30 AM and hiked through freezing glacial winds to catch the alpine glow hitting the peak. The reflection on Laguna de los Tres was completely glass-still for about 4 minutes before the breeze picked up.',
      imageUrl: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1600&q=85',
      location: 'Los Glaciares National Park, Patagonia',
      camera: 'Sony Alpha A7R V',
      lens: 'FE 16-35mm F2.8 GM II',
      focalLength: '24mm',
      aperture: 'f/8.0',
      shutterSpeed: '1/4s',
      iso: '100',
      tags: ['landscape', 'patagonia', 'mountains', 'sunrise', 'reflection', 'nature'],
      likes: [user2._id, user3._id, user4._id],
      saleStatus: 'FOR_SALE',
      price: 1499,
      currency: 'INR',
      licenseInfo: '1-of-1 Original High-Resolution Master with Personal & Non-Exclusive Commercial Rights.',
    });

    const post2 = await Post.create({
      user: user2._id,
      title: 'Neon Rain in Shinjuku Backstreets',
      caption: 'A sudden downpour turned the tarmac into a giant mirror. Waited patiently under an umbrella for someone with a transparent umbrella to complete the composition.',
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=85',
      location: 'Shinjuku, Tokyo, Japan',
      camera: 'Fujifilm X-T5',
      lens: 'XF 33mm F1.4 R LM WR',
      focalLength: '33mm',
      aperture: 'f/1.4',
      shutterSpeed: '1/160s',
      iso: '800',
      tags: ['street', 'tokyo', 'cyberpunk', 'neon', 'rain', 'nightphotography'],
      likes: [user1._id, user4._id],
      saleStatus: 'FOR_SALE',
      price: 2199,
      currency: 'INR',
      licenseInfo: '1-of-1 Original Fine Art RAW Master & Archival Print License.',
    });

    const post3 = await Post.create({
      user: user3._id,
      title: 'Mother Leopard in Acacia Canopy',
      caption: 'Tracked this majestic female for over 6 hours in the Maasai Mara. She finally settled into the crook of a lone acacia tree as the evening golden hour bathed the savannah in amber light.',
      imageUrl: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=1600&q=85',
      location: 'Maasai Mara National Reserve, Kenya',
      camera: 'Canon EOS R5',
      lens: 'RF 400mm F2.8L IS USM',
      focalLength: '400mm',
      aperture: 'f/2.8',
      shutterSpeed: '1/1000s',
      iso: '400',
      tags: ['wildlife', 'safari', 'kenya', 'leopard', 'nature', 'conservation'],
      likes: [user1._id, user2._id],
    });

    const post4 = await Post.create({
      user: user4._id,
      title: 'Symmetry & Shadows: Bauhaus Geometry',
      caption: 'Studying the intersection of concrete, glass, and harsh midday shadows. Minimalist composition focusing purely on tonal contrast and perspective lines.',
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=85',
      location: 'Dessau, Germany',
      camera: 'Leica M11',
      lens: 'Summilux-M 35mm f/1.4 ASPH',
      focalLength: '35mm',
      aperture: 'f/5.6',
      shutterSpeed: '1/500s',
      iso: '64',
      tags: ['architecture', 'minimalism', 'blackandwhite', 'geometry', 'urban'],
      likes: [user1._id, user3._id],
    });

    const post5 = await Post.create({
      user: user1._id,
      title: 'Milky Way Core Over Desert Dunes',
      caption: 'A 15-frame tracked panorama of the galactic center rising above sand ripples. Zero light pollution at Bortle Class 1.',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85',
      location: 'Atacama Desert, Chile',
      camera: 'Sony Alpha A7R V',
      lens: 'Sony FE 24mm F1.4 GM',
      focalLength: '24mm',
      aperture: 'f/1.4',
      shutterSpeed: '15s',
      iso: '3200',
      tags: ['astrophotography', 'milkyway', 'stars', 'night', 'desert', 'space'],
      likes: [user2._id, user4._id],
    });

    user1.bookmarks.push(post2._id, post3._id);
    await user1.save();

    user2.bookmarks.push(post1._id, post5._id);
    await user2.save();

    await Comment.create({
      post: post1._id,
      user: user2._id,
      content: 'Incredible clarity Elena! That reflection is absolute magic. The GM II lens rendering is gorgeous.',
    });

    await Comment.create({
      post: post1._id,
      user: user4._id,
      content: 'Stunning dynamic range! Did you use a graduated ND filter or expose for the highlights?',
    });

    await Comment.create({
      post: post2._id,
      user: user1._id,
      content: 'The color grading on those neon reds and blues is phenomenal. Fuji film simulations?',
    });

    await Comment.create({
      post: post3._id,
      user: user4._id,
      content: 'That 400mm f/2.8 separation is unmatched. What a breathtaking moment to capture Maya!',
    });

    post1.commentsCount = 2;
    await post1.save();
    post2.commentsCount = 1;
    await post2.save();
    post3.commentsCount = 1;
    await post3.save();

    console.log('✅ Demo seed initialized successfully!');
  } catch (error) {
    console.error('Seed error:', error.message);
  }
};

module.exports = seedData;

if (require.main === module) {
  const path = require('path');
  const dotenv = require('dotenv');
  dotenv.config({ path: path.join(__dirname, '../../.env') });
  const connectDB = require('../config/db');
  connectDB().then(() => seedData().then(() => process.exit(0)));
}
