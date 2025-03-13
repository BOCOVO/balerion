module.exports = ({ env }) => ({
  future: {
    unstablePreviewSideEditor: env.bool('BALERION_FEATURES_UNSTABLE_PREVIEW_SIDE_EDITOR', false),
    unstableRelationsOnTheFly: env.bool('BALERION_FEATURES_UNSTABLE_RELATIONS_ON_THE_FLY', false),
  },
});
