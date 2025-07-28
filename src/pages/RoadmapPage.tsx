

const RoadmapPage = () => {
  return (
    <div className="bg-gray-200 p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#4338ca] mb-2">Roadmap</h1>
          <p className="text-gray-600">Updated regularly to report what we are building and what needs fixing</p>
        </div>


          <div className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Bug Fix Log</h3>
              <p className="text-sm text-gray-600">List of resolved issues will be reported here</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Roadmap</h3>
              <p className="text-sm text-gray-600">Features coming soon will be listed here</p>
            </div>
          </div>
        </div>
    
      </div>
    </div>
  );
};

export default RoadmapPage;