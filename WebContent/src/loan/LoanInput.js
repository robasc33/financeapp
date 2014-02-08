define("loan/LoanInput",[
        "dojo/_base/declare",
        "dojo/on",
        "dojo/_base/lang",
        "dijit/registry",
        "dojo/currency",
        "dojox/charting/Chart",
        "dojox/charting/plot2d/Pie",
        "dojox/charting/action2d/Highlight",
        "dojox/charting/action2d/MoveSlice",
        "dojox/charting/action2d/Tooltip",
        "dojox/charting/themes/Dollar",
        "dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
		"dojo/text!loan/templates/LoanInput.html",
        "dijit/form/CurrencyTextBox",
        "dijit/form/NumberSpinner",
        "dijit/form/ComboBox"
		], 
		function(declare, on, lang, registry, Currency, Chart, Pie, Highlight, MoveSlice, Tooltip, Dollar, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template) {
			return declare("loan.LoanInput", [ _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin ], {
				
				templateString : template,
				principal: 0,
				interestPaid: 0,
				monthlyPayment: 0,
				chart: {},

				constructor : function() {
				},
		
				postMixInProperties : function() {
				},
		
				postCreate : function() {
					this.inherited(arguments);
					this._createChart();
					this.own(
			    		// handle "calculate" from widget "LoanInput"
					    this.amountNode.on("change", lang.hitch(this, "_calculate")),
					    this.termNode.on("change", lang.hitch(this, "_calculate")),
					    this.rateNode.on("change", lang.hitch(this, "_calculate"))
		    		);
				},

				// Perform the calculations for our loan repayment
				_calculate: function() {
					this.principal = this.amountNode.get('value');
					if(this.principal == NaN) {
						this.monthlyPayment = 0;
						this.principal = 0;
						this.interestPaid = 0;
					} else {
						var interestRate = this.rateNode.get('value') / 1200;
						var termInMonths = this.termNode.get('value') * 12;
						
						this.monthlyPayment = Math.pow(1 + interestRate, termInMonths) - 1;
						this.monthlyPayment = interestRate + (interestRate / this.monthlyPayment);
						this.monthlyPayment = this.monthlyPayment * this.principal;
						
						this.interestPaid = (this.monthlyPayment * termInMonths) - this.principal;
					}
					
					
					if(this.monthlyPayment == NaN) {
						this.monthlyPayment = 0;
					}
					// update the result field
					var formattedValue = dojo.currency.format(this.monthlyPayment, {currency: "USD"});
					
					this.monthlyPaymentNode.innerHTML = formattedValue;
					this._updateChart();

			},
			
			// Initialize the chart
			_createChart: function() {
	    	    this.chart = new Chart(this.pieChartNode, null);
	    		this.chart.setTheme(Dollar);
	    		this.chart.addPlot("default", {
	    			type : "Pie",
	    			labelOffset : -30,
	    			radius : 90
	    		});
	    		this.chart.addSeries("paymentSeries", []);

	    		new MoveSlice(this.chart, "default");
	    		new Highlight(this.chart, "default");
	    		new Tooltip(this.chart, "default");		
			},
			
			
			 // Update the pie chart
			_updateChart: function() {
    			this.chart.updateSeries("paymentSeries", [ {
    					y : this.principal,
    					stroke : "black",
    					tooltip : "Principal"
    				}, 
    				{
    					y : this.interestPaid,
    					stroke : "black",
    					tooltip : "Interest"
    				} 
    			]);
    			this.chart.render();	
			}
				
			});
});