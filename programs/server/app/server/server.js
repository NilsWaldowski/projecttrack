(function(){if (Meteor.isServer) {

	TrackSteps = new Mongo.Collection('tracksteps');
	StepElements = new Mongo.Collection('stepelements');

	Meteor.startup(function () {
		// code to run on server at startup

		Meteor.methods({
			removeProjects:function() {
				Projects.remove({});
			},
			removeSteps:function() {
				TrackSteps.remove({});
			}
		})
	});
}

})();
