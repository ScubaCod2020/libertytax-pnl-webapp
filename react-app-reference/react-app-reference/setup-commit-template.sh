#!/bin/bash
# Setup script to configure git commit message template
# Run this once to set up the commit template for this repository

echo "🚀 Setting up Git commit message template..."

# Set the commit template for this repository
git config commit.template .gitmessage

echo "✅ Git commit template configured!"
echo ""
echo "📝 How to use:"
echo "   1. Run 'git commit' (without -m flag)"
echo "   2. Your editor will open with the template"
echo "   3. Fill in the sections and save"
echo ""
echo "💡 Pro tip: You can still use 'git commit -m \"message\"' for quick commits"
echo "   But the template is great for complex changes!"
echo ""
echo "📚 Template sections:"
echo "   - PROBLEM: What issue were you solving?"
echo "   - SOLUTION: How did you fix it?"
echo "   - TECHNICAL DETAILS: Specific implementation notes"
echo "   - FILES CHANGED: What files were modified"
echo "   - TESTING: How to verify the changes work"
echo ""
echo "🎯 Remember: Good commit messages are a gift to future you!"
