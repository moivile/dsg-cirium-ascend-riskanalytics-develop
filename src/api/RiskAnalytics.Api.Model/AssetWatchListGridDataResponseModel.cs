namespace RiskAnalytics.Api.Model;
public class AssetWatchListGridDataResponseModel 
{
    public IEnumerable<AssetWatchListDataGridModel> AssetWatchListDataGrid { get; set; } = new List<AssetWatchListDataGridModel>();
    public IEnumerable<string> NotMetCriteriaMsns { get; set; } = new List<string>();
}
