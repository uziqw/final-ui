import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ author: '', content: '', imageUrl: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const res = await fetch('https://final-api-43jq.onrender.com/posts');
    const data = await res.json();
    setPosts(data.reverse()); // newest first
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const postData = {
      author: form.author,
      content: form.content,
      imageUrls: form.imageUrl ? [form.imageUrl] : [],
    };

    if (editingId) {
      const res = await fetch(`https://final-api-43jq.onrender.com/posts/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      const updated = await res.json();
      setPosts(posts.map(p => (p.id === updated.id ? updated : p)));
      setEditingId(null);
    } else {
      const res = await fetch('https://final-api-43jq.onrender.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      const created = await res.json();
      setPosts([created, ...posts]);
    }

    setForm({ author: '', content: '', imageUrl: '' });
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setForm({
      author: post.author,
      content: post.content,
      imageUrl: post.imageUrls[0] || '',
    });
  };

  const handleDelete = async (id) => {
    await fetch(`https://final-api-43jq.onrender.com/posts/${id}`, {
      method: 'DELETE',
    });
    setPosts(posts.filter(p => p.id !== id));
  };

  return (
    <div className="app">
      <h1>Social Feed</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Author"
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
          required
        />
        <textarea
          placeholder="What's on your mind?"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Image URL (optional)"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />
        <button type="submit">{editingId ? 'Update' : 'Post'}</button>
        {editingId && (
          <button type="button" onClick={() => {
            setForm({ author: '', content: '', imageUrl: '' });
            setEditingId(null);
          }}>Cancel</button>
        )}
      </form>

      <div className="posts">
        {posts.map((post) => (
          <div key={post.id} className="post">
            <h3>{post.author}</h3>
            <p>{post.content}</p>
            {post.imageUrls && post.imageUrls.length > 0 && (
              <img src={post.imageUrls[0]} alt="Post" className="post-image" />
            )}
            <div className="meta">
              <span>👍 {post.likes}</span>
              <span>🔄 {post.shares}</span>
              <span>🕒 {new Date(post.timestamp).toLocaleString()}</span>
            </div>
            <div className="actions">
              <button onClick={() => handleEdit(post)}>Edit</button>
              <button onClick={() => handleDelete(post.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
