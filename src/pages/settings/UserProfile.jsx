import userImg from "../../assets/images/man.png";

export const UserProfile = () => {
  return (
    <div className="user-profile">
     

      <div className="row gy-4">
        {/* LEFT COLUMN */}
        <div className="col-md-3">
          <div className="text-center">
            <img src={userImg} className="avatar img-circle" alt="avatar" style={{ width: "80px", marginBottom: "10px" }} />

            <p className="form-label">Upload a different photo...</p>

            <input type="file" className="form-control" />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-md-9 personal-info">
          <h5 style={{ marginBottom: "30px" }}>Personal info</h5>
          <form className="form-horizontal" role="form">
            <div className="form-group row align-items-center">
              <label className="col-md-3 form-label">Username:</label>
              <div className="col-md-8">
                <input className="form-control" type="text" defaultValue="janeuser" />
              </div>
            </div>

            <div className="form-group row mt-3 align-items-center">
              <label className="col-md-3 form-label">Password:</label>
              <div className="col-md-8">
                <input className="form-control" type="password" defaultValue="11111122333" />
              </div>
            </div>

            <div className="form-group row mt-3 align-items-center">
              <label className="col-md-3 form-label">Confirm password:</label>
              <div className="col-md-8">
                <input className="form-control" type="password" defaultValue="11111122333" />
              </div>
            </div>

            <div className="form-group row mt-4">
              <div className="col-md-3"></div>
              <div className="col-md-8">
                <input type="button" className="btn main-btn" value="Save Changes" />
                <span className="mx-2"></span>
                <input type="reset" className="btn filter-btn" value="Cancel" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
