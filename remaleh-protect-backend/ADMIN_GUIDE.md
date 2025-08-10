# 🛡️ Remaleh Protect - Admin Guide

## 🔑 **Admin Access & Authentication**

### **Default Admin Account**
- **Email**: `admin@remaleh.com`
- **Password**: `admin123`
- **Role**: `ADMIN`

⚠️ **Important**: Change the default password immediately after first login!

### **Admin Roles & Permissions**
- **USER**: Regular user with basic access
- **MODERATOR**: Can moderate community content, view user reports
- **ADMIN**: Full system access, user management, system maintenance

---

## 👥 **User Management**

### **View All Users**
```http
GET /api/admin/users
GET /api/admin/users?page=1&per_page=20
GET /api/admin/users?role=USER&status=ACTIVE
GET /api/admin/users?search=john
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Users per page (default: 20)
- `role`: Filter by role (USER, MODERATOR, ADMIN)
- `status`: Filter by status (ACTIVE, SUSPENDED, BANNED, DELETED)
- `search`: Search in email, first_name, last_name

### **Get User Details**
```http
GET /api/admin/users/{user_id}
```

**Response includes:**
- User profile information
- Statistics (total scans, high-risk scans, completed modules)
- Recent activity
- Risk assessment

### **Update User**
```http
PUT /api/admin/users/{user_id}
```

**Updateable Fields:**
- `first_name`
- `last_name`
- `role` (USER, MODERATOR, ADMIN)
- `account_status` (ACTIVE, SUSPENDED, BANNED)
- `risk_level` (LOW, MEDIUM, HIGH, CRITICAL)

**Example:**
```json
{
  "role": "MODERATOR",
  "account_status": "ACTIVE",
  "risk_level": "MEDIUM"
}
```

### **Suspend User**
```http
POST /api/admin/users/{user_id}/suspend
```

**What happens:**
- Sets `account_status` to `SUSPENDED`
- Sets `is_active` to `false`
- User cannot login or access protected endpoints

### **Activate User**
```http
POST /api/admin/users/{user_id}/activate
```

**What happens:**
- Sets `account_status` to `ACTIVE`
- Sets `is_active` to `true`
- User can login and access protected endpoints

### **Delete User**
```http
DELETE /api/admin/users/{user_id}/delete
```

**What happens:**
- **Soft delete** - marks as `DELETED`
- Sets `is_active` to `false`
- Changes email to `deleted_{id}_{email}`
- User data is preserved but inaccessible

---

## 📊 **Admin Dashboard**

### **Get Dashboard Statistics**
```http
GET /api/admin/dashboard
```

**Statistics include:**
- **Users**: Total, active, suspended, new today
- **Scans**: Total, today, high-risk
- **Community**: Total reports, pending, verified
- **Learning**: Progress tracking, completion rates

---

## 🔄 **Bulk Operations**

### **Bulk User Actions**
```http
POST /api/admin/users/bulk-action
```

**Actions:**
- `suspend`: Suspend multiple users
- `activate`: Activate multiple users  
- `delete`: Delete multiple users

**Example:**
```json
{
  "user_ids": [1, 2, 3],
  "action": "suspend"
}
```

⚠️ **Safety**: Admin cannot perform actions on their own account

---

## 🧹 **System Maintenance**

### **System Cleanup**
```http
POST /api/admin/maintenance/cleanup
```

**What gets cleaned:**
- Scans older than 90 days
- Community reports older than 180 days
- Frees up database space

---

## 👤 **Regular User Management**

### **User Profile Management**
Users can manage their own profiles through these endpoints:

#### **View Profile**
```http
GET /api/auth/profile
```

#### **Update Profile**
```http
PUT /api/auth/profile
```

#### **Change Password**
```http
POST /api/auth/change-password
```

#### **Delete Own Account**
```http
POST /api/auth/profile/delete-account
```

#### **Account Recovery**
```http
POST /api/auth/profile/recovery
```

#### **View Activity**
```http
GET /api/auth/profile/activity
```

---

## 🚨 **Security Best Practices**

### **Admin Account Security**
1. **Change default password** immediately
2. **Use strong passwords** (12+ characters, mixed case, symbols)
3. **Enable 2FA** when available
4. **Regular password rotation**
5. **Monitor admin account activity**

### **User Management Security**
1. **Verify user identity** before account changes
2. **Document all admin actions** for audit trail
3. **Use least privilege principle** - only grant necessary permissions
4. **Regular security reviews** of user roles and permissions

### **Data Protection**
1. **Soft delete** users instead of hard delete
2. **Preserve audit trails** for compliance
3. **Regular backups** of user data
4. **Monitor for suspicious activity**

---

## 📱 **Frontend Integration**

### **Admin Panel Components**
The frontend should include:
- **User List View** with search and filtering
- **User Detail View** with statistics
- **Bulk Action Interface** for multiple users
- **Admin Dashboard** with charts and metrics
- **User Management Forms** for updates

### **Role-Based UI**
- **Regular Users**: Basic profile management
- **Moderators**: Community moderation tools
- **Admins**: Full user management interface

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **"Admin privileges required" Error**
- Check if user has `is_admin: true`
- Verify user role is `ADMIN`
- Ensure `admin_required` decorator is used

#### **User Cannot Login**
- Check `account_status` (should be `ACTIVE`)
- Verify `is_active` is `true`
- Check if account was suspended or deleted

#### **Database Errors**
- Ensure database is properly initialized
- Check if all tables exist
- Verify database connection

### **Debug Endpoints**
- `/api/health` - Basic health check
- `/api/test` - Debug endpoint with database info

---

## 📚 **API Reference Summary**

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/admin/users` | GET | List all users | Admin |
| `/api/admin/users/{id}` | GET | Get user details | Admin |
| `/api/admin/users/{id}` | PUT | Update user | Admin |
| `/api/admin/users/{id}/suspend` | POST | Suspend user | Admin |
| `/api/admin/users/{id}/activate` | POST | Activate user | Admin |
| `/api/admin/users/{id}/delete` | DELETE | Delete user | Admin |
| `/api/admin/dashboard` | GET | Admin dashboard | Admin |
| `/api/admin/users/bulk-action` | POST | Bulk user actions | Admin |
| `/api/admin/maintenance/cleanup` | POST | System cleanup | Admin |

---

## 🎯 **Next Steps**

1. **Deploy the updated backend** with admin functionality
2. **Create admin frontend interface** for user management
3. **Set up monitoring** for admin actions
4. **Implement audit logging** for compliance
5. **Add email notifications** for important actions
6. **Create admin training materials** for your team

---

## 📞 **Support**

For technical support or questions about the admin system:
- Check the logs for error messages
- Use the debug endpoints for troubleshooting
- Review the API responses for detailed error information
- Contact the development team for complex issues

---

*Last updated: $(date)*
*Version: 1.0*
