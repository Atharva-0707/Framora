const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const DEMO_USERS = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
];

/**
 * Helper to add an ObjectId to an array if it does not already exist
 */
const addIdIfMissing = (arr, id) => {
  if (!arr) return false;
  const idStr = id.toString();
  if (!arr.some((item) => (item._id ? item._id.toString() : item.toString()) === idStr)) {
    arr.push(id);
    return true;
  }
  return false;
};

/**
 * Idempotent seeder that ensures all 4 demo users and initial community data exist
 */
const seedData = async () => {
  try {
    let createdOrUpdated = false;
    const userMap = {};

    // 1. Ensure all 4 demo users exist and have working passwords
    for (const demoUserData of DEMO_USERS) {
      let user = await User.findOne({
        $or: [
          { email: demoUserData.email.toLowerCase() },
          { username: demoUserData.username.toLowerCase() },
        ],
      }).select('+password');

      if (!user) {
        user = await User.create(demoUserData);
        createdOrUpdated = true;
      } else {
        // Verify password works; if not, repair it via pre-save hook
        const passwordMatches = await user.matchPassword(demoUserData.password);
        if (!passwordMatches) {
          user.password = demoUserData.password;
          await user.save();
          createdOrUpdated = true;
        }
      }
      userMap[demoUserData.username] = user;
    }

    const user1 = userMap['elena_rodriguez'];
    const user2 = userMap['kai_takahashi'];
    const user3 = userMap['maya_chen'];
    const user4 = userMap['marcus_vance'];

    // 2. Ensure follow relationships without duplicates
    let u1Changed = false;
    let u2Changed = false;
    let u3Changed = false;
    let u4Changed = false;

    if (addIdIfMissing(user1.following, user2._id) | addIdIfMissing(user1.following, user3._id) |
        addIdIfMissing(user1.followers, user2._id) | addIdIfMissing(user1.followers, user4._id)) {
      u1Changed = true;
    }

    if (addIdIfMissing(user2.following, user1._id) | addIdIfMissing(user2.following, user4._id) |
        addIdIfMissing(user2.followers, user1._id) | addIdIfMissing(user2.followers, user3._id)) {
      u2Changed = true;
    }

    if (addIdIfMissing(user3.following, user1._id) | addIdIfMissing(user3.followers, user1._id)) {
      u3Changed = true;
    }

    if (addIdIfMissing(user4.following, user1._id) | addIdIfMissing(user4.following, user2._id) |
        addIdIfMissing(user4.followers, user2._id)) {
      u4Changed = true;
    }

    if (u1Changed) { await user1.save(); createdOrUpdated = true; }
    if (u2Changed) { await user2.save(); createdOrUpdated = true; }
    if (u3Changed) { await user3.save(); createdOrUpdated = true; }
    if (u4Changed) { await user4.save(); createdOrUpdated = true; }

    // 3. Ensure demo posts exist if database has no posts
    const postCount = await Post.countDocuments();
    if (postCount === 0) {
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

      // Bookmarks
      addIdIfMissing(user1.bookmarks, post2._id);
      addIdIfMissing(user1.bookmarks, post3._id);
      await user1.save();

      addIdIfMissing(user2.bookmarks, post1._id);
      addIdIfMissing(user2.bookmarks, post5._id);
      await user2.save();

      // Comments
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

      createdOrUpdated = true;
    }

    if (createdOrUpdated) {
      console.log('[Database] Demo seed completed');
    } else {
      console.log('[Database] Demo data already exists');
    }

    return { success: true, createdOrUpdated };
  } catch (error) {
    console.error('[Database] Demo seed error:', error.message);
    throw error;
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
