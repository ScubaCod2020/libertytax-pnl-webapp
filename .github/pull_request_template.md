# Pull Request

## 📋 Description
<!-- Provide a clear and concise description of the changes -->

## 🔗 Related Issues
<!-- Link to any related issues -->
Closes #<!-- issue number -->

## 🧪 Type of Change
<!-- Mark the relevant option with an "x" -->
- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🎨 UI/UX improvement
- [ ] ⚡ Performance improvement
- [ ] 🧹 Code refactoring
- [ ] 🔧 Configuration/build changes

## 🧮 Calculation Changes
<!-- If this PR affects calculations, provide details -->
- [ ] No calculation changes
- [ ] Dual-entry field calculations modified
- [ ] KPI calculations modified  
- [ ] Growth projection calculations modified
- [ ] Regional calculation differences (US/CA) modified
- [ ] Preset scenario calculations modified

**Calculation Testing:**
<!-- If calculations were changed, describe testing performed -->
- [ ] Verified with existing test scenarios
- [ ] Added new test cases for edge cases
- [ ] Confirmed mathematical accuracy
- [ ] Tested dual-entry synchronization

## 🎯 Testing Checklist

### ✅ Automated Testing
- [ ] All existing automated tests pass
- [ ] New tests added for new functionality
- [ ] Calculation tests updated (if applicable)
- [ ] Build completes successfully
- [ ] Bundle size within acceptable limits

### 🖱️ Manual Testing - Core Functionality
- [ ] **Wizard Flow**: Complete wizard journey (Welcome → Inputs → Review → Dashboard)
- [ ] **Regional Testing**: Tested both US and CA regions
- [ ] **Dual-Entry**: Verified percentage ↔ dollar synchronization works
- [ ] **Calculations**: Spot-checked KPI calculations for accuracy
- [ ] **Presets**: Tested Good/Better/Best preset application
- [ ] **Debug Panel**: Verified debug functionality works
- [ ] **Data Persistence**: Confirmed data survives page refresh

### 📱 Mobile/Responsive Testing
- [ ] **Mobile Layout**: Tested on mobile device (iOS/Android)
- [ ] **Tablet Layout**: Tested on tablet device
- [ ] **Touch Interactions**: All buttons/inputs work on touch devices
- [ ] **Keyboard Behavior**: Mobile keyboard doesn't obscure inputs
- [ ] **Orientation**: Works in both portrait and landscape

### 🌐 Browser Compatibility
- [ ] **Chrome**: Tested and working
- [ ] **Firefox**: Tested and working
- [ ] **Safari**: Tested and working (if available)
- [ ] **Edge**: Tested and working (if available)
- [ ] **Mobile Browsers**: Tested on mobile Chrome/Safari

### 🔍 Edge Case Testing
- [ ] **Invalid Inputs**: Tested with invalid/edge case data
- [ ] **Zero Values**: Tested with zero percentages and dollar amounts
- [ ] **Maximum Values**: Tested with 100% and large numbers
- [ ] **Negative Growth**: Tested with negative growth scenarios
- [ ] **Empty States**: Tested with empty/default data

### ⚡ Performance Testing
- [ ] **Load Time**: Initial load time acceptable
- [ ] **Responsiveness**: UI interactions respond quickly
- [ ] **Memory Usage**: No obvious memory leaks
- [ ] **Console**: No errors or warnings in browser console

## 📊 Test Results Summary
<!-- Provide a summary of testing results -->

**Tested Scenarios:**
- Conservative Store: ANF $125, Returns 1600, Growth 10%
- Aggressive Store: ANF $150, Returns 2000, Growth 20%
- Edge Cases: [List specific edge cases tested]

**Issues Found & Resolved:**
- [List any issues found during testing and how they were resolved]

**Known Limitations:**
- [List any known limitations or issues that will be addressed later]

## 📸 Screenshots/Videos
<!-- Add screenshots or videos demonstrating the changes -->

## 🚨 Breaking Changes
<!-- If this introduces breaking changes, describe them -->
- [ ] No breaking changes
- [ ] Breaking changes (describe below):

## 📝 Additional Notes
<!-- Any additional information for reviewers -->

## 🤖 AI Code Review Section
<!-- For @codex and AI assistants -->

### Questions for @codex:
<!-- Tag @codex with specific questions about your changes -->
- [ ] **Code Quality Review:** @codex Please review this code for potential bugs, improvements, and best practices
- [ ] **Performance Analysis:** @codex Any performance implications I should be aware of?
- [ ] **Testing Recommendations:** @codex What additional test scenarios would you recommend?
- [ ] **Security Review:** @codex Any security considerations for these changes?

### AI-Specific Context:
<!-- Help AI understand your changes -->
**Change Type:** <!-- Bug fix / New feature / Refactor / Performance / etc. -->
**Complexity:** <!-- Simple / Medium / Complex -->
**Risk Level:** <!-- Low / Medium / High -->

**Specific Areas for AI Focus:**
- [ ] Calculation logic accuracy
- [ ] React hooks usage
- [ ] TypeScript type safety
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Performance optimization

## 👀 Human Reviewer Checklist
<!-- For human reviewers to complete -->
- [ ] Code follows project standards
- [ ] Changes are well documented
- [ ] Tests are comprehensive
- [ ] No security concerns
- [ ] Performance impact acceptable
- [ ] Mobile compatibility verified
- [ ] AI feedback addressed

---

## 🚀 Pre-Deployment Verification
<!-- Complete before merging to main -->
- [ ] All automated tests pass in CI
- [ ] Manual testing checklist completed
- [ ] No console errors in production build
- [ ] Bundle size impact acceptable
- [ ] Ready for production deployment
