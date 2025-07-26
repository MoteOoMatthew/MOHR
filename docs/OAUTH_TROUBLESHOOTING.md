# 🔐 OAuth Troubleshooting Guide - MOHR HR System

## 🚨 **What is OAuth?**

OAuth (Open Authorization) is a security protocol that allows applications to access resources on behalf of users without sharing their passwords. In our case, it's used for:

- **GitHub authentication** - Accessing your repository
- **Railway deployment** - Connecting to your GitHub repo
- **Vercel deployment** - Importing your code
- **Database connections** - Secure API access

## 🔍 **Common OAuth Issues & Solutions**

### **1. 🔐 Authentication Failures**

#### **Problem: "Invalid credentials"**
```
Error: Authentication failed
```

**Causes:**
- Wrong username/password
- Expired tokens
- Account locked
- Two-factor authentication blocking

**Solutions:**
```bash
# Check Git configuration
git config --list | findstr user

# Fix corrupted config (like we did)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Clear stored credentials
git config --global --unset credential.helper
```

#### **Problem: "Token expired"**
```
Error: OAuth token has expired
```

**Causes:**
- Personal access tokens expire
- Session tokens timeout
- GitHub app permissions revoked

**Solutions:**
- Generate new personal access token
- Re-authenticate with GitHub
- Check token permissions

### **2. 🌐 Network Issues**

#### **Problem: "Cannot connect to OAuth server"**
```
Error: connect ECONNREFUSED
```

**Causes:**
- Corporate firewall blocking OAuth
- Network proxy interference
- DNS resolution problems
- SSL certificate issues

**Solutions:**
```bash
# Test connectivity
curl -I https://api.github.com

# Check proxy settings
git config --global --get http.proxy
git config --global --get https.proxy

# Disable proxy if causing issues
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### **3. 🛠️ Configuration Problems**

#### **Problem: "Corrupted Git config"**
```
user.email=you@example.commoteoo.matthew@gmail.com
```

**Causes:**
- Multiple Git installations
- Manual config editing errors
- Environment variable conflicts

**Solutions:**
```bash
# Check current config
git config --list

# Reset to clean state
git config --global --unset-all user.name
git config --global --unset-all user.email

# Set correct values
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### **Problem: "Multiple Git accounts"**
```
Error: Permission denied
```

**Causes:**
- Work and personal GitHub accounts
- Different SSH keys
- Repository access conflicts

**Solutions:**
```bash
# Use different SSH keys for different accounts
# Create ~/.ssh/config file:
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa_personal

Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa_work
```

### **4. 🔒 Permission Issues**

#### **Problem: "Repository access denied"**
```
Error: 403 Forbidden
```

**Causes:**
- Repository is private
- User doesn't have access
- Organization restrictions
- Branch protection rules

**Solutions:**
- Check repository visibility (public/private)
- Verify GitHub account has access
- Contact repository owner
- Check organization settings

## 🛡️ **Prevention Strategies**

### **1. ✅ Best Practices**

```bash
# Always verify Git config before deployment
git config --list | findstr user

# Use personal access tokens instead of passwords
# Generate at: https://github.com/settings/tokens

# Keep tokens secure and rotate regularly
# Store in environment variables, not in code
```

### **2. 🔧 Pre-Deployment Checklist**

- [ ] Git configuration is correct
- [ ] GitHub account has repository access
- [ ] Personal access token is valid
- [ ] Network connectivity is working
- [ ] No firewall/proxy blocking OAuth
- [ ] Repository is accessible

### **3. 🚀 Alternative Deployment Methods**

#### **Method 1: Manual Deployment (No OAuth)**
```bash
# Use our simple deployment guide
node scripts/deploy-simple.js
```

#### **Method 2: SSH Keys (More Secure)**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add to GitHub account
# Use SSH URLs instead of HTTPS
```

#### **Method 3: GitHub CLI**
```bash
# Install GitHub CLI
# Authenticate once
gh auth login

# Deploy using GitHub CLI
gh repo deploy
```

## 🔧 **Troubleshooting Commands**

### **Diagnostic Commands:**
```bash
# Check Git configuration
git config --list

# Test GitHub connectivity
curl -I https://api.github.com

# Check SSH connectivity
ssh -T git@github.com

# Verify repository access
git ls-remote origin

# Clear cached credentials
git config --global --unset credential.helper
```

### **Fix Commands:**
```bash
# Reset Git configuration
git config --global --unset-all user.name
git config --global --unset-all user.email
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Clear credential cache
git config --global --unset credential.helper

# Test authentication
git push origin main
```

## 🆘 **When to Seek Help**

### **Contact Support When:**
- OAuth errors persist after all fixes
- Repository access is completely blocked
- Network issues prevent all OAuth connections
- Security concerns about tokens/credentials

### **Self-Help Resources:**
- GitHub OAuth documentation
- Railway/Vercel deployment guides
- Git configuration documentation
- Network troubleshooting guides

## 💡 **Pro Tips**

1. **Use Personal Access Tokens** instead of passwords
2. **Keep tokens secure** - never commit them to code
3. **Rotate tokens regularly** for security
4. **Use SSH keys** for more secure authentication
5. **Test connectivity** before deployment
6. **Have backup deployment methods** ready

## 🎯 **Quick Fix for Common Issues**

```bash
# 1. Check and fix Git config
git config --list | findstr user
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 2. Clear credential cache
git config --global --unset credential.helper

# 3. Test GitHub access
curl -I https://api.github.com

# 4. Try deployment again
npm run deploy:vercel_railway
```

---

**Remember:** OAuth issues are usually configuration-related and can be resolved with the right troubleshooting steps! 🔧 