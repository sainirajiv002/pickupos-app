import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, X, Eye, EyeOff, Filter, Download, RefreshCw, UserCheck, UserX } from "lucide-react";

/* ═══════════════════ USER MANAGEMENT PANEL ═══════════════════ */
export default function UserManagement({ supabase }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterBlock, setFilterBlock] = useState("all");
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // New user form state
  const [newUser, setNewUser] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'rider',
    block: 'A BLOCK',
    active: true
  });

  // Fetch all users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      alert('Error fetching users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phone && user.phone.includes(searchQuery)) ||
        user.id.includes(searchQuery)
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Block filter
    if (filterBlock !== 'all') {
      filtered = filtered.filter(user => user.block === filterBlock);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, filterRole, filterBlock, users]);

  // Create new user
  const handleCreateUser = async () => {
    if (!newUser.id || !newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .insert({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone || null,
          password: newUser.password,
          role: newUser.role,
          block: newUser.block,
          active: newUser.active
        });

      if (error) throw error;

      alert('User created successfully!');
      setShowAddUser(false);
      setNewUser({ id: '', name: '', email: '', phone: '', password: '', role: 'rider', block: 'A BLOCK', active: true });
      fetchUsers();
    } catch (error) {
      alert('Error creating user: ' + error.message);
    }
  };

  // Update user
  const handleUpdateUser = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: editingUser.name,
          email: editingUser.email,
          phone: editingUser.phone,
          role: editingUser.role,
          block: editingUser.block,
          active: editingUser.active,
          ...(editingUser.password && { password: editingUser.password })
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      alert('User updated successfully!');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      alert('Error updating user: ' + error.message);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      alert('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      alert('Error deleting user: ' + error.message);
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (user) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ active: !user.active })
        .eq('id', user.id);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      alert('Error updating status: ' + error.message);
    }
  };

  // Export users to CSV
  const exportToCSV = () => {
    const csv = [
      ['User ID', 'Name', 'Email', 'Phone', 'Role', 'Block', 'Status'].join(','),
      ...filteredUsers.map(u => [
        u.id,
        u.name,
        u.email,
        u.phone || '',
        u.role,
        u.block,
        u.active ? 'Active' : 'Inactive'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Get unique blocks
  const blocks = [...new Set(users.map(u => u.block))].filter(Boolean).sort();

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.active).length,
    riders: users.filter(u => u.role === 'rider').length,
    supervisors: users.filter(u => u.role === 'supervisor').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  return (
    <div style={{
      height: "100%",
      overflow: "auto",
      padding: 24,
      background: "#F4F6FA",
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#101828", marginBottom: 8 }}>
          User Management
        </h1>
        <p style={{ color: "#667085", fontSize: 14 }}>
          Manage riders, supervisors, and admin accounts
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Users" value={stats.total} color="#6366F1" />
        <StatCard label="Active Users" value={stats.active} color="#12B76A" />
        <StatCard label="Riders" value={stats.riders} color="#F79009" />
        <StatCard label="Supervisors" value={stats.supervisors} color="#2E90FA" />
      </div>

      {/* Toolbar */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "center",
        border: "1px solid #E4E7EC"
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 300px" }}>
          <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#667085" }} />
          <input
            placeholder="Search by name, email, phone, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 40px",
              border: "1px solid #D1D5DB",
              borderRadius: 8,
              fontSize: 14,
              outline: "none"
            }}
          />
        </div>

        {/* Role Filter */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{
            padding: "10px 12px",
            border: "1px solid #D1D5DB",
            borderRadius: 8,
            fontSize: 14,
            outline: "none",
            cursor: "pointer"
          }}
        >
          <option value="all">All Roles</option>
          <option value="rider">Riders</option>
          <option value="supervisor">Supervisors</option>
          <option value="admin">Admins</option>
        </select>

        {/* Block Filter */}
        <select
          value={filterBlock}
          onChange={(e) => setFilterBlock(e.target.value)}
          style={{
            padding: "10px 12px",
            border: "1px solid #D1D5DB",
            borderRadius: 8,
            fontSize: 14,
            outline: "none",
            cursor: "pointer"
          }}
        >
          <option value="all">All Blocks</option>
          {blocks.map(block => (
            <option key={block} value={block}>{block}</option>
          ))}
        </select>

        {/* Actions */}
        <button
          onClick={() => setShowAddUser(true)}
          style={{
            padding: "10px 16px",
            background: "#F59E0B",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <Plus size={16} />
          Add User
        </button>

        <button
          onClick={fetchUsers}
          style={{
            padding: "10px 16px",
            background: "#fff",
            color: "#344054",
            border: "1px solid #D1D5DB",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <RefreshCw size={16} />
          Refresh
        </button>

        <button
          onClick={exportToCSV}
          style={{
            padding: "10px 16px",
            background: "#fff",
            color: "#344054",
            border: "1px solid #D1D5DB",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <Download size={16} />
          Export
        </button>
      </div>

      {/* User Table */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #E4E7EC",
        overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#667085" }}>
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#667085" }}>
            No users found
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E4E7EC" }}>
                  <th style={thStyle}>User ID</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Block</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: "1px solid #F2F4F7" }}>
                    <td style={tdStyle}>{user.id}</td>
                    <td style={tdStyle}><strong>{user.name}</strong></td>
                    <td style={tdStyle}>{user.email}</td>
                    <td style={tdStyle}>{user.phone || '—'}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: user.role === 'admin' ? '#F4EBFF' : user.role === 'supervisor' ? '#D1E9FF' : '#FEF0C7',
                        color: user.role === 'admin' ? '#6941C6' : user.role === 'supervisor' ? '#1849A9' : '#B54708'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={tdStyle}>{user.block}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => toggleUserStatus(user)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          background: user.active ? '#D1FADF' : '#FEE4E2',
                          color: user.active ? '#027A48' : '#B42318',
                          border: "none",
                          cursor: "pointer"
                        }}
                      >
                        {user.active ? '● Active' : '○ Inactive'}
                      </button>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => setEditingUser({...user})}
                          style={actionButtonStyle}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          style={{...actionButtonStyle, color: "#F04438"}}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {(showAddUser || editingUser) && (
        <Modal
          title={editingUser ? "Edit User" : "Add New User"}
          onClose={() => {
            setShowAddUser(false);
            setEditingUser(null);
          }}
        >
          <UserForm
            user={editingUser || newUser}
            setUser={editingUser ? setEditingUser : setNewUser}
            onSave={editingUser ? handleUpdateUser : handleCreateUser}
            onCancel={() => {
              setShowAddUser(false);
              setEditingUser(null);
            }}
            isEditing={!!editingUser}
          />
        </Modal>
      )}

      {/* Results Count */}
      <div style={{ marginTop: 16, color: "#667085", fontSize: 14, textAlign: "center" }}>
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
}

/* ═══════════════════ STAT CARD ═══════════════════ */
function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 12,
      padding: 20,
      border: "1px solid #E4E7EC"
    }}>
      <div style={{ fontSize: 13, color: "#667085", marginBottom: 8, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

/* ═══════════════════ USER FORM ═══════════════════ */
function UserForm({ user, setUser, onSave, onCancel, isEditing }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* User ID */}
      <div>
        <label style={labelStyle}>User ID *</label>
        <input
          value={user.id}
          onChange={(e) => setUser({...user, id: e.target.value})}
          disabled={isEditing}
          style={inputStyle}
          placeholder="e.g., 851518"
        />
      </div>

      {/* Name */}
      <div>
        <label style={labelStyle}>Full Name *</label>
        <input
          value={user.name}
          onChange={(e) => setUser({...user, name: e.target.value})}
          style={inputStyle}
          placeholder="e.g., Rajiv Singh"
        />
      </div>

      {/* Email */}
      <div>
        <label style={labelStyle}>Email *</label>
        <input
          type="email"
          value={user.email}
          onChange={(e) => setUser({...user, email: e.target.value})}
          style={inputStyle}
          placeholder="e.g., user@shadowfax.in"
        />
      </div>

      {/* Phone */}
      <div>
        <label style={labelStyle}>Phone Number</label>
        <input
          value={user.phone || ''}
          onChange={(e) => setUser({...user, phone: e.target.value})}
          style={inputStyle}
          placeholder="10-digit number"
        />
      </div>

      {/* Password */}
      <div>
        <label style={labelStyle}>Password {isEditing && '(leave blank to keep current)'}</label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            value={user.password || ''}
            onChange={(e) => setUser({...user, password: e.target.value})}
            style={inputStyle}
            placeholder={isEditing ? "Enter new password" : "Enter password"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#667085"
            }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Role */}
      <div>
        <label style={labelStyle}>Role *</label>
        <select
          value={user.role}
          onChange={(e) => setUser({...user, role: e.target.value})}
          style={inputStyle}
        >
          <option value="rider">Rider</option>
          <option value="supervisor">Supervisor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Block */}
      <div>
        <label style={labelStyle}>Block</label>
        <select
          value={user.block}
          onChange={(e) => setUser({...user, block: e.target.value})}
          style={inputStyle}
        >
          <option value="A BLOCK">A BLOCK</option>
          <option value="B BLOCK">B BLOCK</option>
          <option value="C BLOCK">C BLOCK</option>
          <option value="D BLOCK">D BLOCK</option>
        </select>
      </div>

      {/* Active Status */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input
          type="checkbox"
          checked={user.active}
          onChange={(e) => setUser({...user, active: e.target.checked})}
          style={{ width: 16, height: 16, cursor: "pointer" }}
        />
        <label style={{ fontSize: 14, color: "#344054", cursor: "pointer" }}>
          User is active
        </label>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button
          onClick={onSave}
          style={{
            flex: 1,
            padding: "12px",
            background: "#F59E0B",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          {isEditing ? 'Update User' : 'Create User'}
        </button>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "12px",
            background: "#fff",
            color: "#344054",
            border: "1px solid #D1D5DB",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════ MODAL ═══════════════════ */
function Modal({ title, children, onClose }) {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 20
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        maxWidth: 500,
        width: "100%",
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid #E4E7EC",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#101828", margin: 0 }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#667085",
              padding: 4
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ STYLES ═══════════════════ */
const thStyle = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 700,
  color: "#667085",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const tdStyle = {
  padding: "14px 16px",
  fontSize: 14,
  color: "#344054"
};

const actionButtonStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#667085",
  padding: 6
};

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#344054",
  marginBottom: 6
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #D1D5DB",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  fontFamily: "'Plus Jakarta Sans', sans-serif"
};
