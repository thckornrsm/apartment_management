const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createPost = async (req, res) => {
    const { title, message, priority } = req.body;
    const adminId = req.user.id;
  
    try {
      const post = await prisma.communityPost.create({
        data: { title, message, priority, adminId },
      });
      res.status(201).json({ message: "Post created", post });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

  exports.getPost = async (req, res) => {
    const { id } = req.params;
  
    try {
      const post = await prisma.communityPost.findUnique({ where: { id: Number(id) } });
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  exports.getAllPosts = async (req, res) => {
    try {
      const posts = await prisma.communityPost.findMany({
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { name: true, email: true } } }
      });
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  exports.updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, message, priority } = req.body;
  
    try {
      const updated = await prisma.communityPost.update({
        where: { id: Number(id) },
        data: { title, message, priority },
      });
      res.json({ message: "Post updated", post: updated });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  exports.deletePost = async (req, res) => {
    const { id } = req.params;
  
    try {
      await prisma.communityPost.delete({ where: { id: Number(id) } });
      res.json({ message: "Post deleted" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
