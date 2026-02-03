# Obsidian Plugin Submission Rules Summary

This document synthesizes the key steps and requirements for submitting a plugin to the official Obsidian community plugin list, based on the official developer documentation.

## Key Steps for Plugin Submission:

1.  **Publish to GitHub**:
    *   The plugin repository must be publicly accessible on GitHub.
    *   Include a `README.md` file with clear instructions and information about the plugin.
    *   Include a `LICENSE` file in the root of the repository.
    *   Include a valid `manifest.json` file.

2.  **Create a GitHub Release**:
    *   For each new version, create a GitHub release.
    *   The release must include the following assets:
        *   `main.js`: The compiled JavaScript file for your plugin.
        *   `manifest.json`: The plugin's manifest file.
        *   Optionally, `styles.css`: If your plugin uses custom styles.

3.  **Submit for Review**:
    *   Submit your plugin for review by creating a Pull Request (PR) to the `community-plugins.json` file in the official Obsidian plugins repository.
    *   The PR should follow the specified format and guidelines.

4.  **Handle Review Comments**:
    *   Be prepared to address feedback and make necessary changes based on the review process.

5.  **Announce Plugin**:
    *   After the plugin is approved and published, you can announce it to the community.

## Important Considerations:

*   **Plugin Quality**: Ensure your plugin is stable, functional, and adheres to Obsidian's development guidelines.
*   **Security**: Plugins are reviewed for security vulnerabilities.
*   **User Experience**: Aim for a good user experience.
*   **Maintainability**: Be prepared to maintain your plugin after submission.

## Further Details and Best Practices:

Refer to the official Obsidian Developer Documentation for comprehensive details:
[Submit your plugin - Developer Documentation](https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin)
