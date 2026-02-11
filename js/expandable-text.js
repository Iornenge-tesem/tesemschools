/**
 * Expandable Text Toggle
 * Handles show more/show less functionality for long text sections
 */

function toggleExpandableText(button) {
  var container = button.closest('.expandable-text');
  if (!container) return;

  var preview = container.querySelector('.expandable-text__preview');
  var full = container.querySelector('.expandable-text__full');
  var moreText = button.querySelector('.toggle-more');
  var lessText = button.querySelector('.toggle-less');

  if (!preview || !full || !moreText || !lessText) return;

  // Check current state
  var isExpanded = full.style.display !== 'none';

  if (isExpanded) {
    // Collapse: Show preview, hide full
    preview.style.display = 'block';
    full.style.display = 'none';
    moreText.style.display = 'inline';
    lessText.style.display = 'none';
    button.classList.remove('expanded');
    
    // Smooth scroll to section top
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    // Expand: Hide preview, show full
    preview.style.display = 'none';
    full.style.display = 'block';
    moreText.style.display = 'none';
    lessText.style.display = 'inline';
    button.classList.add('expanded');
  }
}
