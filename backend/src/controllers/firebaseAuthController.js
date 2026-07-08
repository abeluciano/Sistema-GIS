export function firebaseProfile(req, res) {
  res.json({
    firebaseUser: {
      uid: req.firebaseUser.uid,
      email: req.firebaseUser.email,
      name: req.firebaseUser.name
    }
  });
}
