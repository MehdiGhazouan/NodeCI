const mongoose = require('mongoose');
const Blog = mongoose.model('Blog');

module.exports = (blogId) => {
    return Blog.findByIdAndRemove(blogId);
}